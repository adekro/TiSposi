$(document).ready(function(){
    $("#img_gif").hide();
    $("#img_caricata").hide();
    $("#panel_dedica").hide();
    load_gallery();
  
});

function go_camera(){

    $(".f_camera").remove();

    var input = document.createElement("input"); 
    input.type = "file"; 
    input.className = "f_camera"; 
    input.id="id_camera";
    input.name="name_camera";

    input.onchange = function(e) { 
       fn_up(input.files[0]);
    };
    
    $("#uti").append(input);


    $('.f_camera').show();
    $('.f_camera').focus();
    $('.f_camera').click();
    $('.f_camera').hide();
    
}

function fn_up(file){     

    go_gif();
    
    if(!['image/jpeg','image/png','image/jpg'].includes(file.type)){
        alert("caricare solo immagini")
    }else{
        const form_data = new FormData();
        form_data.append('name_camera',file);

        fetch("./up.php",{
            method:"POST",
            body:form_data
        }).then(function(response){
            return response.json();
        }).then(function(responseData){
            $("#img_caricata").append("<img src='"+responseData.image_source+"' />");
            end_gif();

            load_gallery();
        });


    }
    
}

function go_gif(){
    let r =0;
    let obj="";

    $("#img_gif").show();

    r=Math.random()*10;
    obj="<div id='load_gif'>";
    obj=obj+"<img src='./img/gif/"+parseInt(r)+".gif'>";
    obj=obj+"</div>";

    $("#img_gif").append(obj);

}
function end_gif(){
    $("#load_gif").remove();
    $("#img_gif").hide();
}

function load_gallery(){
    go_gif();
    $(".item_gallery").remove();
    fetch("./gallery.php",{
        method:"GET"        
    }).then(function(response){
        return response.json();
    }).then(function(responseData){
        let obj="";
        $.each(responseData,function(){

            if(this[0]=="T"){
                obj="";
                obj="<div class='item_gallery'>";
                obj=obj+"<div class='item_gallery_text'>";
                obj=obj+this.substring(4);
                obj=obj+"</div>";
                obj=obj+"</div>";
            }else{
                obj="";
                obj="<div class='item_gallery'>";
                obj=obj+"<div class='item_gallery_foto'>";
                obj=obj+"<img src='./img_up/"+this+"' />";
                obj=obj+"</div>";
                obj=obj+"</div>";
            }

            
            $("#cont_gallery").append(obj);
        });

        end_gif();
    });
}

function go_dedica(){
    $("#panel_dedica").show();
}
function invia_dedica(){

    go_gif();
    
    const form_data = new FormData();
    form_data.append('testo_dedica', $("#item_dedica_textarea").val());

    fetch("./upd.php",{
        method:"POST",
        body:form_data
    }).then(function(response){
        return response.json();
    }).then(function(responseData){
        end_gif();
    });

    $("#item_dedica_textarea").val("");
    $("#panel_dedica").hide();
}
    



