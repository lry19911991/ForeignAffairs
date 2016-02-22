<?php
/*
 * Copyright (C) 2012 Bryntum AB
 */

require_once('functions.php');

// command to run launcher (phantomjs or slimerjs) in console/terminal
define('EXPORT_LAUNCHER', 'phantomjs');
// command to check accessibility of the launcher in console/terminal
// must give some not empty output
define('EXPORT_LAUNCHER_VERIFIER', 'phantomjs --version');
// path to ImageMagick bin folder
//define('IMGK_PATH', '/usr/local/bin/');
define('IMGK_PATH', '');
// path where temporary HTML and resulting PNG/PDF files will be created
//define('OUTPUT_PATH', '/some/folder');
define('OUTPUT_PATH', dirname(__FILE__));
// if you change OUTPUT_PATH then URL string pointing to that folder should be placed here.
// By default it's set to this script URL w/o 'server.php' ending
//define('OUTPUT_URL', 'http://localhost/somefolder/');
define('OUTPUT_URL', getCurrentPageURL(true));

try {
    if (!isset($_POST['html'])) {
        throw new Exception('Error in request data.');
    }

    // get request parameters
    $html           = json_decode($_POST['html'], true);
    $format         = stripslashes($_POST['format']);
    $orientation    = stripslashes($_POST['orientation']);
    $range          = stripslashes($_POST['range']);
    $fileFormat     = stripslashes($_POST['fileFormat']);

    // generate name of the created single PDF file
    $out            = $range.buildUniqueFileName('-exportedPanel', '.').$fileFormat;

    // output file full path
    $outputFilePath = OUTPUT_PATH."/$out";
    // output file URL
    $outputFileURL  = OUTPUT_URL.$out;

    // put transferred pages HTML code to temporary files
    $files = buildHTMLFiles(OUTPUT_PATH, $html);

    // render HTML files to PNG images
    $images = renderHTMLFiles($files, OUTPUT_PATH, OUTPUT_URL, $format, $orientation);

    // build single PDF/PNG output file
    convertImagesToFile($images, $outputFilePath, $fileFormat);

    // cleanup temporary png/html files
    removeFiles(array_merge($images, $files), OUTPUT_PATH);


    header('Content-Type: application/json; charset=utf-8');
    //header("access-control-allow-origin: *");

    // return response
    die(json_encode(array(
        'success'   => true,
        // return url of the created file
        'url'       => $outputFileURL
    )));

} catch (Exception $e) {

    header('Content-Type: application/json; charset=utf-8');
    //header("access-control-allow-origin: *");

    die(json_encode(array(
        'success'   => false,
        'msg'       => $e->getMessage()
    )));

}
