/**
 * @author Dmitry Kharchenko (unclenorton@gmail.com)
 * @link github.com/unclenorton
 * @requires jQuery
 *
 * Description:
 * iGlow is a jQuery plugin that creates an underlying glow for images and/or text
 * using SVG for supporting browsers and filters for IE
 *
 * Usage:
 * $(selector).iGlow(config);
 *
 * config is an object contents configuraton parameters:
 *
 * - lighten: The number of times the image is blended onto itself to increase intensity.
 * - turbulence, displace, dilate, erode: Values for respective SVG filters. Optional. It is recommended to use the default values,
 * as increasing parameters may greatly affect performance. Defaults are 1 (except turbulence, which is 0).
 * - blur: Standard deviation for Gaussian blur.
 * - useImage {boolean}: Whether to show the original lightened image under the blurred one. Mainly for debugging purposes.
 * - IEFalloff {0-100}: The second parameter for IE's falloff transparency filter. Default is 55. Arguably makes the effect
 * look better over dark backgrounds when set to lower values.
 * - fadeInSpeed: The parameter for jQuery.fadeIn animation used in showing the blur effect. Default is 500.
 *
 *
 * TODO:
 * 1. Implement CSS filters for supporting browsers (especially the upcoming version of Firefox).
 * 2. Find a neater way for displaying blur with IE filters.
 * 3. ?????
 * 4. PROFIT!
 * 
 */

(function($) {

	$.iGlow = $.iGlow || {
		version: '1.0'
	};

	//Default parameters
	$.iGlow.conf = {
		lighten: 2,
		turbulence: 0,
		displace: 1,
		dilate: 1,
		erode: 1,
		blur: 14,
		useImage: false,

		IEFalloff : 55,
		fadeInSpeed : 500
	};

	$.fn.iGlow = function(conf) {

		//Extend defaults
		conf = $.extend($.iGlow.conf, conf);

		var aImages = [];

		var fadeInSpeed = (supportsSvgBlur()) ? conf.fadeInSpeed : 0;

		this.each(function(i) {
			var jImage = $(this);
			var blurOffset = 5;
			var ieBlur = conf.blur;

			if(supportsSvgBlur()) {
				aImages[i] = new SVGGlow(jImage, conf);
			} else {
				conf.ieBlur = ieBlur;
				aImages[i] = new MSGlow(jImage, conf);
				blurOffset = 1;
			}

			if(!jImage.hasClass('iglow')) {
				var glowWrapper = $('<div></div>').attr('id', 'iglow-' + i).attr('class', 'iglow').append(aImages[i]);
				var iWrapper = $('<div></div>').attr('class', 'iglow-wrapper');
				jImage.attr('class', 'iglow').css({
					'position': 'relative',
					'zIndex': '2'
				}).wrap(iWrapper);

				if(supportsSvgBlur()) {
					glowWrapper.css({
						'position': 'absolute',
						'zIndex': '1',
						'left': -conf.blur * blurOffset,
						'top': -conf.blur * blurOffset
					});
				} else {

					aImages[i].css({
						width: '100%',
						height: '100%'
					});
					glowWrapper.css({
						'position': 'absolute',
						'zIndex': '1',
						'left': -ieBlur * blurOffset - 3,
						'top': -ieBlur * blurOffset - 3
					});
				}
				glowWrapper.hide();
				jImage.after(glowWrapper);
				glowWrapper.fadeIn(fadeInSpeed);
			}
		});
		return this;
	};

	/**
	 * Creates and returns an SVG object with filters
	 * set according to the parameters passed to it.
	 * 
	 * @param {jQuery} jImage jQuery-wrapped <img> element
	 * @param {object} conf   Configuration object
	 * @return {jQuery}	jQuery-wrapped SVG element
	 */
	
	function SVGGlow(jImage, conf) {

		var svgNS = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('xmlns', svgNS);
		svg.setAttribute('version', '1.1');

		// Set the safety padding for the canvas
		svg.setAttribute('width', jImage.width() + conf.blur * 8);
		svg.setAttribute('height', jImage.height() + conf.blur * 8);

		defs = document.createElementNS(svgNS, 'defs');

		var filter = document.createElementNS(svgNS, 'filter');
		filter.setAttribute('id', 'gaussian_blur');

		// Lighten
		var fblend = document.createElementNS(svgNS, 'feBlend');
		for(var il = 0; il < conf.lighten; il++) {
			fblend = document.createElementNS(svgNS, 'feBlend');
			fblend.setAttribute('in', ((il) ? 'lightened' : 'SourceGraphic'));
			fblend.setAttribute('result', 'lightened');
			fblend.setAttribute('mode', 'screen');
			filter.appendChild(fblend);
		}

		if(conf.turbulence) {
			var fturbulence = document.createElementNS(svgNS, 'feTurbulence');
			fturbulence.setAttribute('baseFrequency', "2");
			fturbulence.setAttribute('numOctaves', "8");
			fturbulence.setAttribute('seed', '125');
			fturbulence.setAttribute('in', 'lightened');
			fturbulence.setAttribute('result', 'turb');
			filter.appendChild(fturbulence);

			var fdisplacement = document.createElementNS(svgNS, 'feDisplacementMap');
			fdisplacement.setAttribute('scale', conf.displace);
			fdisplacement.setAttribute('xChannelSelector', 'R');
			fdisplacement.setAttribute('yChannelSelector', 'B');
			fdisplacement.setAttribute('in', 'SourceGraphic');
			fdisplacement.setAttribute('in2', 'turb');
			fdisplacement.setAttribute('result', 'lightened');
			filter.appendChild(fdisplacement);
		}

		if (conf.dilate) {
			fmorph = document.createElementNS(svgNS, 'feMorphology');
			fmorph.setAttribute('in', 'lightened');
			fmorph.setAttribute('operator', 'dilate');
			fmorph.setAttribute('radius', conf.dilate);
			fmorph.setAttribute('result', 'lightened');
			filter.appendChild(fmorph);
		}
		
		if (conf.erode) {
			var fmorph = document.createElementNS(svgNS, 'feMorphology');
			fmorph.setAttribute('in', 'lightened');
			fmorph.setAttribute('operator', 'erode');
			fmorph.setAttribute('radius', conf.erode);
			fmorph.setAttribute('result', 'lightened');
			filter.appendChild(fmorph);	
		}
		
		if (conf.blur) {
			var gblur = document.createElementNS(svgNS, 'feGaussianBlur');
			gblur.setAttribute('in', 'lightened');
			gblur.setAttribute('stdDeviation', conf.blur);
			filter.appendChild(gblur);
		}
		
		if(conf.useImage) {
			fblend = document.createElementNS(svgNS, 'feBlend');
			fblend.setAttribute('in', 'SourceGraphic');
			fblend.setAttribute('mode', 'lihgten');
			filter.appendChild(fblend);
		}

		defs.appendChild(filter);
		svg.appendChild(defs);

		var simage = document.createElementNS(svgNS, 'image');

		simage.setAttribute('x', conf.blur * 5);
		simage.setAttribute('y', conf.blur * 5);
		simage.setAttribute('width', jImage.width());
		simage.setAttribute('height', jImage.height());

		simage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", jImage.attr('src'));
		simage.setAttribute('style', 'filter:url(#gaussian_blur)');
		svg.appendChild(simage);

		return svg;
	}

	/**
	 * A polyfill for implementing the glow in IE
	 * 
	 * @param {jQuery} jImage jQuery-wrapped <img> element
	 * @param {object} conf   Configureation object
	 * @return {jQuery} jQuery-wrapped DOM structure containing a blurred clone of original image
	 * 
	 */
	function MSGlow(jImage, conf) {
		var jClone = jImage.clone(true).removeAttr('class');

		var lighten = '';
		for (var i = 0; i < conf.lighten; i++) {
			lighten += "progid:DXImageTransform.Microsoft.Wave(freq=0, lightStrength=100, strength=1, add=1) ";
		}

		// It is essential to have the Blur filter be the last one. Failing to do so may result in black/dark
		// pixels near the border.
		// The second filter (Alpha) uses style=2 parameter to implement opacity falloff.
		jClone.css({
			filter: lighten
					+" progid:DXImageTransform.Microsoft.Alpha(opacity=100, finishopacity=" + conf.IEFalloff +", style=2)"
					+" progid:DXImageTransform.Microsoft.Blur(pixelradius="+ (conf.ieBlur) + ")"
		});
		return jClone;
	}

	/**
	 * Check for SVG blur filter availability
	 * @return {boolean}
	 */
	function supportsSvgBlur() {
		if (document.createElementNS) {
			var blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
			blur.setAttribute("stdDeviation", "2");
			return(typeof blur.setStdDeviation !== 'undefined');
		} else {
			return false;
		}
	}
})(jQuery);