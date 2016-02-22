/*
 Copyright (C) 2012 Bryntum AB <info@bryntum.com>

 This file uses parts of the PhantomJS project from Ofi Labs.

 Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
 Copyright (C) 2011 Ivan De Marino <ivan.de.marino@gmail.com>
 Copyright (C) 2011 James Roe <roejames12@hotmail.com>
 Copyright (C) 2011 execjosh, http://execjosh.blogspot.com

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 * Neither the name of the <organization> nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var system = require('system'),
    page   = require('webpage').create();

if (system.args.length === 6) {
    var addresses       = system.args[1].split('|'),
        filesPath       = system.args[2],
        // stip any trailing slashes
        filesURL        = system.args[3].replace(/\/$/, ''),
        outputArray     = [],
        size            = system.args[4].split('*');

    page.paperSize      = size.length === 2 ? { width: size[0], height: size[1], orientation: system.args[5], margin: '0px' }
                                       : { format: system.args[4], orientation: system.args[5], margin: '1cm' };
} else {
    console.log('Usage: render.js filenames [paperwidth*paperheight|paperformat]');
    phantom.exit(1);
}

var openPage = function (pages) {
    if (!pages.length) {
        console.log(outputArray.join('|'));
        phantom.exit();

        return
    }

    var url     = filesURL + '/' + pages.shift()

    page.open(url, function (status) {
        if (status !== 'success') {
            console.log("FAIL:" + url)
            phantom.exit(2);
        }

        var date            = new Date().getTime();
        var outputFilename  = filesPath + '/print-' + date + '.png';

        setTimeout(function () {
            page.render(outputFilename);
            outputArray.push(outputFilename);

            setTimeout(function () {
                openPage(pages)
            }, 1)
        }, 1);
    });
}

openPage(addresses);
