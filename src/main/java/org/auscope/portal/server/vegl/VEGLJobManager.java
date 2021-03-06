package org.auscope.portal.server.vegl;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auscope.portal.server.web.security.ANVGLUser;

/**
 * Class that talks to the data objects to retrieve or save data
 *
 * @author Cihan Altinay
 * @author Josh Vote
 * @author Richard Goh
 */
public class VEGLJobManager {
    protected final Log logger = LogFactory.getLog(getClass());

    private VEGLJobDao veglJobDao;
    private VEGLSeriesDao veglSeriesDao;
    private VGLJobAuditLogDao vglJobAuditLogDao;
    private VGLSignatureDao vglSignatureDao;

    public List<VEGLSeries> querySeries(String user, String name, String desc) {
        return veglSeriesDao.query(user, name, desc);
    }

    public List<VEGLJob> getSeriesJobs(int seriesId, ANVGLUser user) {
        return veglJobDao.getJobsOfSeries(seriesId, user);
    }

    public List<VEGLJob> getUserJobs(ANVGLUser user) {
        return veglJobDao.getJobsOfUser(user);
    }

    public List<VEGLJob> getPendingOrActiveJobs() {
        return veglJobDao.getPendingOrActiveJobs();
    }

    public List<VEGLJob> getInQueueJobs() {
        return veglJobDao.getInQueueJobs();
    }

    public VEGLJob getJobById(int jobId, ANVGLUser user) {
        return veglJobDao.get(jobId, user);
    }

    public VEGLJob getJobById(int jobId, String stsArn, String clientSecret, String s3Role, String userEmail) {
        return veglJobDao.get(jobId, stsArn, clientSecret, s3Role, userEmail);
    }

    public void deleteJob(VEGLJob job) {
        veglJobDao.deleteJob(job);
    }

    public VEGLSeries getSeriesById(int seriesId, String userEmail) {
        return veglSeriesDao.get(seriesId, userEmail);
    }

    public VGLSignature getSignatureByUser(String user) {
        return vglSignatureDao.getSignatureOfUser(user);
    }

    public void saveJob(VEGLJob veglJob) {
        veglJobDao.save(veglJob);
    }

    /**
     * Create the job life cycle audit trail. If the creation is unsuccessful, it
     * will silently fail and log the failure message to error log.
     * @param oldJobStatus
     * @param curJob
     * @param message
     */
    public void createJobAuditTrail(String oldJobStatus, VEGLJob curJob, String message) {
        VGLJobAuditLog vglJobAuditLog = null;
        try {
            vglJobAuditLog = new VGLJobAuditLog();
            vglJobAuditLog.setJobId(curJob.getId());
            vglJobAuditLog.setFromStatus(oldJobStatus);
            vglJobAuditLog.setToStatus(curJob.getStatus());
            vglJobAuditLog.setTransitionDate(new Date());
            vglJobAuditLog.setMessage(message);

            // Failure in the creation of the job life cycle audit trail is
            // not critical hence we allow it to fail silently and log it.
            vglJobAuditLogDao.save(vglJobAuditLog);
        } catch (Exception ex) {
            logger.warn("Error creating audit trail for job: " + vglJobAuditLog, ex);
        }
    }

    /**
     * Create the job life cycle audit trail. If the creation is unsuccessful, it
     * will silently fail and log the failure message to error log.
     * @param oldJobStatus
     * @param curJob
     * @param message
     */
    public void createJobAuditTrail(String oldJobStatus, VEGLJob curJob, Exception exception) {
        String message = ExceptionUtils.getStackTrace(exception);
        if(message.length() > 1000){
            message = message.substring(0,1000);
        }
        VGLJobAuditLog vglJobAuditLog = null;
        try {
            vglJobAuditLog = new VGLJobAuditLog();
            vglJobAuditLog.setJobId(curJob.getId());
            vglJobAuditLog.setFromStatus(oldJobStatus);
            vglJobAuditLog.setToStatus(curJob.getStatus());
            vglJobAuditLog.setTransitionDate(new Date());
            vglJobAuditLog.setMessage(message);

            // Failure in the creation of the job life cycle audit trail is
            // not critical hence we allow it to fail silently and log it.
            vglJobAuditLogDao.save(vglJobAuditLog);
        } catch (Exception ex) {
            logger.warn("Error creating audit trail for job: " + vglJobAuditLog, ex);
        }
    }

    public void deleteSeries(VEGLSeries series) {
        veglSeriesDao.delete(series);
    }

    public void saveSeries(VEGLSeries series) {
        veglSeriesDao.save(series);
    }

    public void saveSignature(VGLSignature vglSignature) {
        vglSignatureDao.save(vglSignature);
    }

    public void setVeglJobDao(VEGLJobDao veglJobDao) {
        this.veglJobDao = veglJobDao;
    }

    public void setVeglSeriesDao(VEGLSeriesDao veglSeriesDao) {
        this.veglSeriesDao = veglSeriesDao;
    }

    public void setVglJobAuditLogDao(VGLJobAuditLogDao vglJobAuditLogDao) {
        this.vglJobAuditLogDao = vglJobAuditLogDao;
    }

    public void setVglSignatureDao(VGLSignatureDao vglSignatureDao) {
        this.vglSignatureDao = vglSignatureDao;
    }

}