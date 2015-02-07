function writeList(articles){
    $('#media-content').html($('<ul>'));
    for (var i in articles){
        var fileName = articles[i].name;
        if (fileName.substr(-3) === '.md'){
            squatName = fileName.slice(0,-3);
            $('#media-content ul').append(
                $('<li>').append(
                    $('<a>',{href:'#'+squatName, text: squatName})
                )
            )
        }
    }
}

function writeArticle(md){
    // md to html
    m = md;
    html = marked(md);
    // Change links from relative to absolute
    var content = $('<div>').html(html);
    var rawURL = 'https://raw.githubusercontent.com/'+GITHUB_USER+'/'+GITHUB_REPO+'/master/';
    var absolute = /^https?:\/\//i ;
    content.find('img').each(function(){
        var src = $(this).attr('src') ;
        if (!absolute.test(src)){
            $(this).attr('src',rawURL+src);
        }
    });
    // append
    $('#media-content').html(content.html());
}

function fetchFail(){
    $('#media-content').text('Sorry, we didn\'t find the squat you\'re looking for !\n Go and open it!');
}

function fetch(squat){
    var repoURL = 'https://api.github.com/repos/'+GITHUB_USER+'/'+GITHUB_REPO+'/contents/';
    // Show the description of the required squat
    var articleURL = repoURL+squat+'.md';
    $.ajax({
        type: 'GET',
        //dataType: 'Text',  //use jsonp data type in order to perform cross domain ajax
        //crossDomain: true,
        url: articleURL,
        success: function (responseData, textStatus, jqXHR) {
            // To fix ! what about different encodings ?
            if (responseData.encoding === 'base64'){
                writeArticle(atob(responseData.content));
            }
        },
        error: function (responseData, textStatus, errorThrown) {
           fetchFail();
        }
    });
}

function route(){
    var squat = window.location.hash.substr(1);
    if (squat === ''){
        $('#media').hide();
        $('#panel').show();
        $('.leaflet-popup-pane').show();
    }else{
        $('#panel').hide();
        $('.leaflet-popup-pane').hide();
        $('#media').show();
        $('#media-squat-name').text(squat);
        $('#media-content').text('Loading...');
        fetch(squat);
    }
}
$(window).on('hashchange', route);

$(document).ready(function () {
    marked.setOptions({
      sanitize: true,
    });
    route();
});