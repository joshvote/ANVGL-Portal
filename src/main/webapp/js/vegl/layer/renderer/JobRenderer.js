/**
 * An implementation of a portal.layer.Renderer for rendering ANVGLJob objects
 * that belong to a user(s)
 */
Ext.define('vegl.layer.renderer.JobRenderer', {
    extend: 'portal.layer.renderer.Renderer',

    polygonColor : null,

    constructor: function(config) {
        this.callParent(arguments);
    },

    /**
     * A function for displaying generic data from a variety of data sources. This function will
     * raise the renderstarted and renderfinished events as appropriate. The effect of multiple calls
     * to this function (i.e. calling displayData again before renderfinished is raised) is undefined.
     *
     * This function will re-render itself entirely and thus may call removeData() during the normal
     * operation of this function
     *
     * function(portal.csw.OnlineResource[] resources,
     *          portal.layer.filterer.Filterer filterer,
     *          function(portal.layer.renderer.Renderer this, portal.csw.OnlineResource[] resources, portal.layer.filterer.Filterer filterer, bool success) callback
     *
     * returns - void
     *
     * resources - an array of data sources which should be used to render data
     * filterer - A custom filter that can be applied to the specified data sources
     * callback - Will be called when the rendering process is completed and passed an instance of this renderer and the parameters used to call this function
     */
    displayData : function(resources, filterer, callback) {
        this.removeData();

        this.fireEvent('renderstarted', this, resources, filterer);

        if (!window.VL_AUTHENTICATED) {
            this.fireEvent('renderfinished', this);
            callback(this, resources, filterer, false);
            Ext.Msg.alert('Login Required', 'You are not currently logged in. Please <a href="login.html">login</a> to view your jobs');
            return;
        }

        this.requestObj = Ext.Ajax.request({
            url: 'secure/listJobs.do',
            scope: this,
            callback: function(options, success, response) {
                this.requestObj = null;
                if (!success) {
                    this.fireEvent('renderfinished', this);
                    callback(this, resources, filterer, false);
                    return;
                }

                var responseObj = Ext.JSON.decode(response.responseText);
                if (!responseObj.success) {
                    this.fireEvent('renderfinished', this);
                    callback(this, resources, filterer, false);
                    return;
                }

                //Iterate over our jobs, pull out the downloads and associated BBoxs
                //Use the BBoxs to add geometry to the map
                var primitives = [];
                for (var i = 0; i < responseObj.data.length; i++) {
                    var job = Ext.create('vegl.models.Job', responseObj.data[i]);
                    if (job.get('status') !== vegl.models.Job.STATUS_DONE) {
                        continue;
                    }

                    var fakeRecord = Ext.create('portal.csw.CSWRecord', {
                        id: 'job-' + job.get('id'),
                        name: job.get('name'),
                        contactOrg: job.get('status')
                    });
                    var downloads = job.get('jobDownloads');
                    for (var j = 0; j < downloads.length; j++) {
                        var bbox = Ext.create('portal.util.BBox', {
                            northBoundLatitude: downloads[j].get('northBoundLatitude'),
                            southBoundLatitude: downloads[j].get('southBoundLatitude'),
                            eastBoundLongitude: downloads[j].get('eastBoundLongitude'),
                            westBoundLongitude: downloads[j].get('westBoundLongitude'),
                        });


                        var polygonList = bbox.toPolygon(this.map, (this._getPolygonColor(this.polygonColor))[0], 4, 0.75,(this._getPolygonColor(this.polygonColor))[1], 0.4, undefined,
                                job.get('id'), fakeRecord, undefined, this.parentLayer);

                        for (var k = 0; k < polygonList.length; k++) {
                            primitives.push(polygonList[k]);
                        }
                    }
                }

                if (!Ext.isEmpty(primitives)) {
                    this.primitiveManager.addPrimitives(primitives);
                }
                this.fireEvent('renderfinished', this);
                callback(this, resources, filterer, true);
            }
        });


    },


    _getPolygonColor : function(colorCSV){
        if(colorCSV && colorCSV.length > 0){
            var colorArray=colorCSV.split(",");
            return colorArray;
        }else{
            //default blue color used if no color is specified
            return ['#0003F9','#0055FE'];
        }
    },

    /**
     * An abstract function for creating a legend that can describe the displayed data. If no
     * such thing exists for this renderer then null should be returned.
     *
     * function(portal.csw.OnlineResource[] resources,
     *          portal.layer.filterer.Filterer filterer)
     *
     * returns - portal.layer.legend.Legend or null
     *
     * resources - (same as displayData) an array of data sources which should be used to render data
     * filterer - (same as displayData) A custom filter that can be applied to the specified data sources
     */
    getLegend : function(resources, filterer) {
        return null;
    },

    /**
     * An abstract function that is called when this layer needs to be permanently removed from the map.
     * In response to this function all rendered information should be removed
     *
     * function()
     *
     * returns - void
     */
    removeData : function() {
        this.primitiveManager.clearPrimitives();
    },


    abortDisplay : function() {
        if (this.requestObj) {
            Ext.Ajax.abort(this.requestObj);
            this.requestObj = null;
        }

    }
});