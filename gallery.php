<?php
$directory="img_up";

$dirs= array();
$files = array();

$formdati ="";

if ($handle = opendir("./" . $directory))
{
  while ($file = readdir($handle))
  {
    if ($file != "." & $file != "..") {
        $extension=pathinfo($file, PATHINFO_EXTENSION);
        
        if($extension=="txt"){

          $myfile = fopen("./".$directory."/".$file, "r") or die("Unable to open file!");
          array_push($files,"TXT_".fread($myfile,filesize("./".$directory."/".$file)));  
          fclose($myfile);
          
        }else{
          array_push($files,$file);            
        }       

    }
  }
}
closedir($handle);
echo json_encode($files);

?>