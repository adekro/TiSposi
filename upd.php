<?php

$testo=$_POST['testo_dedica'];
$testo=RemoveSpecialChar($testo);
$new_name=time().'.txt';

if($testo==""){



}else{
    $myfile = fopen('img_up/' . $new_name, "w") or die("Unable to open file!");
    fwrite($myfile, $testo);
    fclose($myfile);
}


    
$data=array('text_source' => 'img_up/' . $new_name);

echo json_encode($data);

function RemoveSpecialChar($str)
{
    $res = preg_replace('/[0-9\@\.\;\""]+/', '', $str);
    return $res;
}
?>