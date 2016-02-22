<?php
/**
 * Copyright (C) 2014 Bryntum AB
 */

/**
 * Returns URL of the current page.
 * @param  boolean $strip_file_name True to strip script name and return only its folder URL.
 * @return string                   URL of the current page.
 */
function getCurrentPageURL($strip_file_name = false)
{
    $proto = @$_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
    $port = $_SERVER['SERVER_PORT'] != '80' ? ':'.$_SERVER['SERVER_PORT'] : '';

    $url = $proto.'://'.$_SERVER['SERVER_NAME'].$port.$_SERVER['REQUEST_URI'];

    return $strip_file_name ? preg_replace('/\/[^\/]+$/', '/', $url) : $url;
}

/**
 * Builds unique file name using current timestamp.
 * @param  string $prefix    File name prefix.
 * @param  string $extension File extension.
 * @return string            Built file name.
 */
function buildUniqueFileName($prefix, $extension)
{
    return $prefix. microtime(true) .$extension;
}

/**
 * Puts transferred HTML-code to temporary files.
 * @param  string $folder Path to the temporary files folder.
 * @param  array[Object]  $html   An array with HTML-code of pages.
 * @return array[string]          An array of created temporary file names.
 */
function buildHTMLFiles($folder, $html)
{
    $result = array();
    $i = 1;

    foreach ($html as $content) {
        $file = "$folder/".buildUniqueFileName('printHtml-'.$i, '.html');
        $fh     = fopen($file, 'w');

        //check if file is writable
        if (is_writable($file)) {
            fwrite($fh, $content['html']);
            fclose($fh);
            $result[] = basename($file);
        } else {
            throw new Exception('Can\'t create or read file.');
        }
    }

    return $result;
}

/**
 * Renders HTML files to PNG images.
 * Calls 'render.js' script using phantomjs (or slimerjs depending on configuration).
 * @param  array[string] $files         Array of file names to render.
 * @param  string $outputFolder Folder having HTML-files to render.
 * @param  string $outputURL    URL mapped to the $outputFolder.
 * @param  string $format       Paper format.
 * @param  string $orientation  Paper orientation.
 * @return string               String of concatenated built file names separated with '|'c character.
 */
function renderHTMLFiles($files, $outputFolder, $outputURL, $format, $orientation)
{
    $output  = array();
    // check if launcher (phantomjs or slimerjs) is installed and reachable
    exec(EXPORT_LAUNCHER_VERIFIER, $output);

    if (empty($output)) {
        throw new Exception('Launcher cannot be found. PhantomJS (or SlimerJS) not installed or not reachable.');
    }

    $output = array();
    // run PhantomJs (or slimerjs) with parameters : temporary html filenames sent, format of the page and page orientation
    $command = EXPORT_LAUNCHER.' '.dirname(__FILE__).'/render.js "'.implode('|', $files)."\" \"$outputFolder\" \"$outputURL\" \"$format\" \"$orientation\" 2>&1";

    exec($command, $output);

    $generated = null;

    foreach ($output as $line) {
        if (strpos($line, $outputFolder) == 0) {
            $generated = $line;
        }
    }

    if (!$generated) {
        throw new Exception('There was some problem generating the file');
    }

    // phantomjs returns names of temp png files separated with '|'
    return explode('|', $generated);
}

/**
 * Converts PNG files listed in the provided array to a single PDF (or PNG) file.
 * @param  array[string] $images  PNG files list.
 * @param  string $file   Resulting single PDF (or PNG) file.
 * @param  string $format Resulting file format. Either "png" or "pdf".
 */
function convertImagesToFile($images, $file, $format)
{
    $output = array();
    exec(IMGK_PATH.'convert -version', $output);

    if (empty($output)) {
        throw new Exception('ImageMagick not installed or not reachable.');
    }

    $files  = '"'.implode('" "', $images).'"';

    // run imagemagick merging separate png's into one pdf or png depending on the file format
    if ($format == 'pdf') {
        $cmd = IMGK_PATH."convert $files \"$file\"";
    } else {
        $cmd = IMGK_PATH."montage -mode concatenate -tile 1x $files \"$file\"";
    }

    $output = array();
    exec($cmd, $output);

    if (!file_exists($file) || filesize($file) <= 0) {
        throw new Exception('There was some problem creating the file');
    }
}

/**
 * Removes listed files from a folder.
 * @param  array[string] $files   List of files to remove.
 * @param  string $folder Folder to remove files from.
 */
function removeFiles($files, $folder)
{
    chdir($folder);
    foreach ($files as $file) {
        unlink($file);
    }
}
