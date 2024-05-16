<?php

if(isset($_FILES['name_camera']))
{
    $extension=pathinfo($_FILES['name_camera']['name'], PATHINFO_EXTENSION);
    $new_name=time().'.'.$extension;
    
    move_uploaded_file($_FILES['name_camera']['tmp_name'],'img_up/'.$new_name);

    $data=array('image_source' => 'img_up/' . $new_name);

    echo json_encode($data);
}

?>