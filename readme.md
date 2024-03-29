# jGlow
A jQuery plugin that makes images glow, creating AmbiLight-like effect.

# Usage
The usage is simple:

`$('img').jGlow(options);`

The demo can be seen here:[https://unclenorton.github.io/jglow/](https://unclenorton.github.io/jglow/). Click the images to activate the effect. Animation is added to visually benchmark the performance.

# Options

Currently, the plugin supports the following options:

- **lighten:** The number of times the image is blended onto itself to increase intensity.
- **turbulence**, **displace**, **dilate**, **erode:** Values for respective SVG filters. Optional. It is recommended to use the default values, as increasing parameters may greatly affect performance. Defaults are 1 (except turbulence, which is 0).
- **blur:** Standard deviation for Gaussian blur.
- **useImage** *{boolean}:* Whether to show the original lightened image under the blurred one. Mainly for debugging purposes.
- **IEFalloff** *{0-100}:* The second parameter for IE's falloff transparency filter. Default is 55. Arguably makes the effect look better over dark backgrounds when set to lower values.
- **fadeInSpeed:** The parameter for jQuery.fadeIn animation used in showing the blur effect. Default is 500.
- **forceSVG:** Specify whether to force using SVG filter instead of CSS one. As of Chrome 23, this results in faster rendering, though CSS is of course preferrable.

# Compatibility

The plugin should work more or less uniformly across all browsers supporting SVG filter effects. See [http://caniuse.com/svg-filters](http://caniuse.com/svg-filters) for the full list. Browsers supporting CSS filters [http://caniuse.com/css-filters](http://caniuse.com/css-filters) switch to CSS filters automatically, unless `forceSVG` property is not set to true.

For IE 9 and older, it uses `filter` property, which may yield a bit different rendering across different systems and configurations. In addition, I haven't been able to tweak the settings in a way that would produce a result completely identical with SVG version even on my machine. You are welcome to contribute, therefore.

# General notes
As seen in demo, the effect looks best when used against the patterned background, as the irregularities of the pattern make up for the regularity of the blur itself.

Also, for reason yet unknown, SVG filters perform quite slow in the current release of Mozilla Firefox (16 at the time of writing this). Since version 17 is up to release by 20 Nov 2012, there is a chance that CSS filters will be implemented in addition to SVG by that time.

Internet Explorer 10 will only work with the plugin in native Standards mode (there is generally no reason to switch it to another, but this may happen accidentally).

# License

This plugin is released under MIT license and distributed *'as is'*, without any warranty, explicit or implied.
