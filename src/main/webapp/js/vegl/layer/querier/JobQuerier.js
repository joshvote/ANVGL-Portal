/**
 * Class for parsing a set of Job objects
 * using the Querier interface
 *
 */
Ext.define('vegl.layer.querier.JobQuerier', {
    extend: 'portal.layer.querier.Querier',

    constructor: function(config){
        this.callParent(arguments);
    },

    /**
     * See parent class for definition
     */
    query : function(queryTarget, callback) {

        var jobId = queryTarget.get('id');
        Ext.Ajax.request({
            url: 'secure/listJobs.do',
            params: {
                jobId: jobId
            },
            scope: this,
            callback: function(options, success, response) {
                if (!success) {
                    callback(this, [], queryTarget);
                    return;
                }

                var responseObj = Ext.JSON.decode(response.responseText);
                if (!responseObj.success) {
                    callback(this, [], queryTarget);
                    return;
                }


            }
        });


        //console.log(queryTarget);
        //callback(this, [], queryTarget);

        /*var cswRecord = queryTarget.get('cswRecord');
        if (!cswRecord) {
            callback(this, [], queryTarget);
            return;
        }

        var keywordsString = "";
        var keywords = cswRecord.get('descriptiveKeywords');
        for (var i = 0; i < keywords.length; i++) {
            keywordsString += keywords[i];
            if (i < (keywords.length - 1)) {
                keywordsString += ', ';
            }
        }

        var panel = Ext.create('portal.layer.querier.BaseComponent', {
            border : false,
            autoScroll : true,
            items : [{
                layout : 'fit',
                items : [{
                    xtype : 'fieldset',
                    items : [{
                        xtype : 'displayfield',
                        fieldLabel : 'Source',
                        value : Ext.util.Format.format('<a target="_blank" href="{0}">Link back to registry</a>', cswRecord.get('recordInfoUrl'))
                    },{
                        xtype : 'displayfield',
                        fieldLabel : 'Title',
                        anchor : '100%',
                        value : cswRecord.get('name')
                    }, {
                        xtype : 'textarea',
                        fieldLabel : 'Abstract',
                        anchor : '100%',
                        value : cswRecord.get('description'),
                        readOnly : true
                    },{
                        xtype : 'displayfield',
                        fieldLabel : 'Keywords',
                        anchor : '100%',
                        value : keywordsString
                    },{
                        xtype : 'displayfield',
                        fieldLabel : 'Contact Org',
                        anchor : '100%',
                        value : cswRecord.get('contactOrg')
                    },{
                        fieldLabel : 'Resources',
                        xtype : 'onlineresourcepanel',
                        cswRecords : cswRecord
                    }]
                }]
            }]
        });

        callback(this, [panel], queryTarget);*/
    }
});