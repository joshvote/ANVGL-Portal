/**
 * An implementation of a portal.layer.Renderer for rendering ANVGLJob objects
 * that belong to a user(s)
 */
Ext.define('vegl.layer.renderer.JobRenderer', {
    extend: 'portal.layer.renderer.Renderer',

    polygonColor : null,

    jobStore: null,

    constructor: function(config) {
        this.jobStore = Ext.create('Ext.data.Store', {
            model: 'vegl.models.Job',
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        });

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

                this.jobStore.loadRawData(responseObj);

                //Iterate over our jobs, pull out the downloads and associated BBoxs
                //Use the BBoxs to add geometry to the map
                var primitives = [];
                var allRecords = [];
                for (var i = 0; i < this.jobStore.getCount(); i++) {
                    var job = this.jobStore.getAt(i);

                    if (job.get('status') === vegl.models.Job.STATUS_UNSUBMITTED) {
                        continue;
                    }

                    var fakeRecord = Ext.create('portal.csw.CSWRecord', {
                        id: 'vljob-' + job.get('id'),
                        name: job.get('name'),
                        contactOrg: job.get('status'),
                        onlineResources: []
                    });
                    var allBboxes = [];
                    var downloads = job.get('jobDownloads');
                    for (var j = 0; j < downloads.length; j++) {
                        var bbox = Ext.create('portal.util.BBox', {
                            northBoundLatitude: downloads[j].get('northBoundLatitude'),
                            southBoundLatitude: downloads[j].get('southBoundLatitude'),
                            eastBoundLongitude: downloads[j].get('eastBoundLongitude'),
                            westBoundLongitude: downloads[j].get('westBoundLongitude'),
                        });
                        allBboxes.push(bbox);

                        var polygonList = bbox.toPolygon(this.map, (this._getPolygonColorForJob(job))[0], 4, 0.75,(this._getPolygonColorForJob(job))[1], 0.4, undefined,
                                job.get('id'), fakeRecord, undefined, this.parentLayer);

                        for (var k = 0; k < polygonList.length; k++) {
                            primitives.push(polygonList[k]);
                        }
                    }
                    fakeRecord.set('geographicElements', allBboxes);
                    allRecords.push(fakeRecord);
                }

                if (!Ext.isEmpty(primitives)) {
                    this.primitiveManager.addPrimitives(primitives);
                }
                this.parentLayer.set('cswRecords', allRecords);
                this.fireEvent('renderfinished', this);
                callback(this, resources, filterer, true);
            }
        });


    },


    _getPolygonColorForJob: function(job) {
        switch(job.get('status')) {

        case vegl.models.Job.STATUS_FAILED:
        case vegl.models.Job.STATUS_ERROR:
        case vegl.models.Job.STATUS_CANCELLED:
            return ['#F70000','#FC0000'];

        case vegl.models.Job.STATUS_ACTIVE:
            return ['#00F22C','#00F22C'];

        case vegl.models.Job.STATUS_PENDING:
        case vegl.models.Job.STATUS_INQUEUE:
        case vegl.models.Job.STATUS_PROVISIONING:
            return ['#EFEF00','#EFEF00'];

        default:
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
        this.jobStore.removeAll();
        this.parentLayer.set('cswRecords', []);
    },


    abortDisplay : function() {
        if (this.requestObj) {
            Ext.Ajax.abort(this.requestObj);
            this.requestObj = null;
        }

    }
});