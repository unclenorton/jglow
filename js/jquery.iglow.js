/**
 * @author Dims (unclenorton@gmail.com)
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
 */

(function($) {

	$.iGlow = $.iGlow || {
		version: '1.0'
	};

	//Default parameters
	$.iGlow.conf = {
		lighten: 2,
		turbulence: 0,
		displace: 5,
		dilate: 1,
		erode: 6,
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
				aImages[i] = new SVGGlow(jImage, i, conf);
			} else {
				conf.ieBlur = ieBlur;
				aImages[i] = new MSGlow(jImage, i, conf);
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

	function SVGGlow(jImage, i, conf) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		svg.setAttribute('version', '1.1');

		svg.setAttribute('width', jImage.width() + conf.blur * 8);
		svg.setAttribute('height', jImage.height() + conf.blur * 8);

		defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

		var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
		filter.setAttribute('id', 'gaussian_blur');

		//lighten
		var fblend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
		for(var il = 0; il < conf.lighten; il++) {
			fblend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
			fblend.setAttribute('in', ((il) ? 'lightened' : 'SourceGraphic'));
			fblend.setAttribute('result', 'lightened');
			fblend.setAttribute('mode', 'screen');
			filter.appendChild(fblend);
		}

		if(conf.turbulence) {
			var fturbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
			fturbulence.setAttribute('baseFrequency', "2");
			fturbulence.setAttribute('numOctaves', "8");
			fturbulence.setAttribute('seed', '125');
			fturbulence.setAttribute('in', 'lightened');
			fturbulence.setAttribute('result', 'turb');
			filter.appendChild(fturbulence);

			var fdisplacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
			fdisplacement.setAttribute('scale', conf.displace);
			fdisplacement.setAttribute('xChannelSelector', 'R');
			fdisplacement.setAttribute('yChannelSelector', 'B');
			fdisplacement.setAttribute('in', 'SourceGraphic');
			fdisplacement.setAttribute('in2', 'turb');
			fdisplacement.setAttribute('result', 'lightened');
			filter.appendChild(fdisplacement);
		}

		if (conf.dilate) {
			fmorph = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
			fmorph.setAttribute('in', 'lightened');
			fmorph.setAttribute('operator', 'dilate');
			fmorph.setAttribute('radius', conf.dilate);
			fmorph.setAttribute('result', 'lightened');
			filter.appendChild(fmorph);
		}
		
		if (conf.erode) {
			var fmorph = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
			fmorph.setAttribute('in', 'lightened');
			fmorph.setAttribute('operator', 'erode');
			fmorph.setAttribute('radius', conf.erode);
			fmorph.setAttribute('result', 'lightened');
			filter.appendChild(fmorph);	
		}
		
		if (conf.blur) {
			var gblur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
			gblur.setAttribute('in', 'lightened');
			gblur.setAttribute('stdDeviation', conf.blur);
			filter.appendChild(gblur);
		}
		
		if(conf.useImage) {
			fblend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
			fblend.setAttribute('in', 'SourceGraphic');
			fblend.setAttribute('mode', 'lihgten');
			filter.appendChild(fblend);
		}

		defs.appendChild(filter);
		svg.appendChild(defs);

		var simage = document.createElementNS('http://www.w3.org/2000/svg', 'image');

		simage.setAttribute('x', conf.blur * 5);
		simage.setAttribute('y', conf.blur * 5);
		simage.setAttribute('width', jImage.width());
		simage.setAttribute('height', jImage.height());

		simage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", jImage.attr('src'));
		simage.setAttribute('style', 'filter:url(#gaussian_blur)');
		svg.appendChild(simage);

		return svg;
	}

	function MSGlow(jImage, i, conf) {
		var jClone = jImage.clone(true).removeAttr('class');

		var lighten = '';
		for (var i = 0; i < conf.lighten; i++) {
			lighten += "progid:DXImageTransform.Microsoft.Wave(freq=0, lightStrength=100, strength=1, add=1) ";
		}

		jClone.css({
			filter: lighten
					+" progid:DXImageTransform.Microsoft.Alpha(opacity=100, finishopacity=" + conf.IEFalloff +", style=2)"
					+" progid:DXImageTransform.Microsoft.Blur(pixelradius="+ (conf.ieBlur) + ")"
		});
		return jClone;
	}

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