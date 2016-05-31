package org.auscope.portal.view;

import org.auscope.portal.core.services.responses.csw.CSWRecord;
import org.auscope.portal.core.view.knownlayer.KnownLayerSelector;

/**
 * A selector which always returns NotRelated
 * @author Josh Vote (CSIRO)
 *
 */
public class NullSelector implements KnownLayerSelector {

    @Override
    public RelationType isRelatedRecord(CSWRecord record) {
        return RelationType.NotRelated;
    }

}
