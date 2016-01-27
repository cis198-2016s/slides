// Copyright 2014-2015 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
// Modified slightly for CIS 198. Changes released under the original license.

/*jslint browser: true, es5: true */
/*globals $: true, rootPath: true */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    if (!window.playgroundUrl) {
        return;
    }

    var featureRegexp = new RegExp('^\s*#!\\[feature\\(\.*?\\)\\]');
    var elements = document.querySelectorAll('code.rust');

    Array.prototype.forEach.call(elements, function(el) {
        el.onmouseover = function(e) {
            if (el.contains(e.relatedTarget)) {
                return;
            }

            var a = document.createElement('a');
            a.setAttribute('class', 'test-arrow');
            a.textContent = 'Run';

            var code = "";
            for (var i = 0; i < el.childNodes.length; i++) {
                code += el.childNodes[i].textContent + "\n";
            }
            code = code.trim();

            if (!code.match(/^fn main\b/m)) {
                // If the code doesn't have `fn main()`, add it
                code = "fn main() {\n" + code.replace(/^/gm, "    ") + "\n}";
            }
            code = "#![allow(dead_code)]\n" + code;

            var channel = '';
            if (featureRegexp.test(code)) {
                channel = '&version=nightly';
            }

            a.setAttribute('href', window.playgroundUrl + '?code=' +
                           encodeURIComponent(code) + channel);
            a.setAttribute('target', '_blank');

            el.appendChild(a);
        };

        el.onmouseout = function(e) {
            if (el.contains(e.relatedTarget)) {
                return;
            }

            el.removeChild(el.querySelectorAll('a.test-arrow')[0]);
        };
    });
});
