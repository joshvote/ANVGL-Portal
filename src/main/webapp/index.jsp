<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>Auscope Portal</title>
<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=abcdefg" type="text/javascript"></script>

<!-- Bring in the ExtJs Libraries and CSS -->
<link rel="stylesheet" type="text/css" href="js/ext-2.2/resources/css/ext-all.css"/>
<link rel="stylesheet" type="text/css" href="js/column-tree.css"/>
<script type="text/javascript" src="js/ext-2.2/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="js/ext-2.2/ext-all.js"></script>
<script type="text/javascript" src="js/ColumnNodeUI.js"></script>

<script src="js/wms-gs-1_1_1.js" type="text/javascript"></script>
<script src="js/wms_layer.js" type="text/javascript"></script>
<script src="js/web_map_service.js" type="text/javascript"></script>

<!-- Page specific javascript -->
<script type="text/javascript">
    //this runs on DOM load - you can access all the good stuff now.
    Ext.onReady(function() {
        var map;
        /*var tree = new Ext.tree.ColumnTree({
         region: 'west',
         split: true,
         collapsible: true,
         margins:'100 0 5 5',
         cmargins:'100 5 5 5',
         width: 300,
         //height: 300,
         rootVisible:false,
         autoScroll:true,
         title: 'Data Sources',
         //renderTo: Ext.getBody(),

         columns:[{
         header:'Layers',
         width:80,
         dataIndex:'task'
         },{
         header:'Visible',
         width:20,
         dataIndex:'duration'
         }],

         loader: new Ext.tree.TreeLoader({
         dataUrl:'column-data.json',
         uiProviders:{
         'col': Ext.tree.ColumnNodeUI
         }
         }),

         root: new Ext.tree.AsyncTreeNode({
         text:'Tasks'
         })
         });*/

        var tree = new Ext.tree.TreePanel({
            title : 'Data Sources',
            region: 'west',
            split: true,
            collapsible: true,
            margins:'100 0 5 5',
            cmargins:'100 5 5 5',
            width: 200,
            useArrows:true,
            autoScroll:true,
            animate:true,
            //enableDD:true,
            containerScroll: true,
            rootVisible: false,

            // auto create TreeLoader
            //dataUrl: 'get-nodes.php',
            dataUrl: 'dataSources.json',
            //dataUrl: 'tree-data.jsone',
            //loader : myLoader,

            root: {
                nodeType: 'async',
                text: 'Ext JS',
                draggable:false,
                id:'root'
            }
        });

        tree.on('checkchange', function(node, isChecked) {
            //var clickedNode = tree.getSelectionModel().getSelectedNode();
            //alert(node + " " + isChecked);
            if (isChecked) {
                //do something
                //alert('about to check');
                if (node.attributes.tileOverlay == null || node.attributes.tileOverlay == '') {
                    //alert('isnull');
                    var tileLayer = new GWMSTileLayer(map, new GCopyrightCollection(""), 1, 17);
                    tileLayer.baseURL = node.attributes.wmsUrl;
                    tileLayer.layers = node.id;

                    //alert('madetilelayer');
                    node.attributes.tileOverlay = new GTileLayerOverlay(tileLayer);
                }
                //alert('adding ' + node.attributes.tileOverlay);
                map.addOverlay(node.attributes.tileOverlay);
                ///alert('added layer');
            }
            else { //not checked
                map.removeOverlay(node.attributes.tileOverlay);
            }

        });

        tree.on('expandnode', function(node) {
            //var clickedNode = tree.getSelectionModel().getSelectedNode();
            //alert(node + " expanded");
        });

        var westPanel = {
         region:'west',
         id:'west-div',
         title:'Data Sources',
         split:true,
         //width: 200,
         //minSize: 175,
         maxSize: 400,
         collapsible: true,
         margins:'100 0 5 5',
         cmargins:'100 5 5 5'
         };

        var centerPanel = new Ext.Panel({region:"center", margins:'100 5 5 0'});

        var viewport = new Ext.Viewport({
            layout:'border',
            items:[tree, centerPanel]
        });

        //<![CDATA[

        //function load() {
        //alert(window.location.host);
        //alert(${2+2});

        // Is user's browser suppported by Google Maps?
        if (GBrowserIsCompatible()) {
            //var map = new GMap2(document.getElementById("map-div"));
            map = new GMap2(centerPanel.body.dom);
            // Large pan and zoom control
            map.addControl(new GLargeMapControl());
            // Toggle between Map, Satellite, and Hybrid types
            map.addControl(new GMapTypeControl());

            var startZoom = 4;
            //map.setCenter(new GLatLng(${centerLat},${centerLon}), 4);
            map.setCenter(new google.maps.LatLng(-18.604601, 138.493652), 5);
            map.setMapType(G_SATELLITE_MAP);

            //Thumbnail map
            var Tsize = new GSize(150, 150);
            map.addControl(new GOverviewMapControl(Tsize));

        }
    });

    // Create a base icon for all of our markers that specifies the
    // shadow, icon dimensions, etc.
    /*  var baseIcon = new GIcon();
     baseIcon.shadow = "http://www.google.com/mapfiles/shadow50.png";
     baseIcon.iconSize = new GSize(20, 34);
     baseIcon.shadowSize = new GSize(37, 34);
     baseIcon.iconAnchor = new GPoint(9, 34);
     baseIcon.infoWindowAnchor = new GPoint(9, 2);
     baseIcon.infoShadowAnchor = new GPoint(18, 25);

     // To Do: Checkboxes
     var CAT_ICONS = [];
     CAT_ICONS["DEFAULT_ICON"] = tinyIcon("green");
     CAT_ICONS["Hyperspectral"] = tinyIcon("red");
     CAT_ICONS["Mineral Occurences"] = tinyIcon("green");
     CAT_ICONS["Geological Units"] = tinyIcon("gray");
     CAT_ICONS["Geochemistry"] = tinyIcon("blue");
     CAT_ICONS["Bore holes"] = tinyIcon("yellow");
     CAT_ICONS["GNNS / GPS"] = tinyIcon("purple");
     CAT_ICONS["Seismic Imaging"] = tinyIcon("purple");
     */
    //]]>
</script>

<style>
    body {
        margin: 0px;
        padding: 0px;
    }

    #header-container {
        width: 100%;
        height: 100px;
        background-color: #ffffff;
    }

    #header {
        background-image: url( img/img-auscope-banner.gif );
        background-repeat: no-repeat;
        width: 100%;
        height: 100px;
    #margin : auto;
    }

    #logo {
        float: left;
        padding-top: 40px;
        padding-left: 0px;
    }

    #login {
        float: right;
        padding-right: 30px;
        padding-top: 10px;
    }

    img {
        border: none;
    }

    #nav {
        float: right;

        padding-top: 0px;
        padding-right: 40px;
    }

    #nav ul {
        text-align: left;
        padding: 0px;
        margin: 0px;
    #width : 1024 px;
    }

    #nav ul li {
        display: inline;
        padding: 0px;
        margin: 0px;
    }

    #nav-example {
        background: url("/img/navigation.gif") no-repeat;
        width: 300px;
        height: 38px;
        margin: 0;
        padding: 0;
        float: right;
        padding-right: 40px; 
    }

    #nav-example span {
        display: none;
    }

    #nav-example li, #nav-example a {
        height: 38px;
        display: block;
    }

    #nav-example li {
        float: left;
        list-style: none;
        display: inline;
    }

    #nav-example-01 {
        width: 100px;
    }

    #nav-example-02 {
        width: 100px;
    }

    #nav-example-03 {
        width: 100px;
    }



    #nav-example-01 a:hover {
        background: url("/img/navigation.gif") 0px -38px no-repeat;
    }

    #nav-example-02 a:hover {
        background: url("/img/navigation.gif") -100px -38px no-repeat;
    }

    #nav-example-03 a:hover {
        background: url("/img/navigation.gif") -200px -38px no-repeat;
    }


</style>

</head>
<!--<body onload="load()" onunload="GUnload()">-->
<body onunload="GUnload()">

<div id="header-container">
    <div id="header">
        <div id="logo">
            <a href="index.index.jsp#"></a>
        </div>
        <!--<div id="nav">-->
            <ul id="nav-example">
                <li id="nav-example-01"><a href="index.index.jsp#"><span>sfd</span></a></li>
                <li id="nav-example-02"><a href="index.index.jsp#"><span>sfd</span></a></li>
                <li id="nav-example-03"><a href="index.index.jsp#"><span>sfd</span></a></li>
            </ul>
        <!--</div>-->
    </div>
</div>


<!--<div id="west-div">Some stuff here</div>
<div id="center-div">Some other stuff here</div>
<div id="map-div"></div>-->
</body>
</html>