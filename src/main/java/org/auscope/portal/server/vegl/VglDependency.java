package org.auscope.portal.server.vegl;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Represents a single package/puppet/other dependency that must be installed
 * for a job to successfully run at a compute provider. Dependencies are typically
 * read from a SSSC instance.
 * @author Josh Vote
 *
 */
public class VglDependency implements Serializable, Cloneable {
    private static final long serialVersionUID = 5436097345907506395L;

    public enum DependencyType {
        Puppet,
        HPC,
        Requirements,
        Python,
        Toolbox,
        Unknown
    }

    /** The primary key for this download*/
    private Integer id;
    /** The raw descriptive type as a string*/
    private String type;
    /** The dependency/package name*/
    private String identifier;
    /** The actual version of the package to be installed (can be null)*/
    private String version;
    /** The repository where this dependency can be sourced from (can be null)*/
    private String repository;

    /** The job that owns this dependency*/
    @JsonIgnore
    private VEGLJob parent;

    /**
     * Default constructor
     */
    public VglDependency() {
        this(null);
    }

    /**
     *
     * @param id The primary key for this dependency
     */
    public VglDependency(Integer id) {
        super();
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    /**
     * Parses the contents of the identifier field into a DependencyType enum
     * @return
     */
    public DependencyType getIdentifierTyped() {
        switch (identifier) {
        case "puppet":
            return DependencyType.Puppet;
        case "hpc":
            return DependencyType.HPC;
        case "requirements":
            return DependencyType.Requirements;
        case "python":
            return DependencyType.Python;
        case "toolbox":
            return DependencyType.Toolbox;
        default:
            return DependencyType.Unknown;
        }
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }

    /**
     * The primary key for this dependency
     * @return
     */
    public Integer getId() {
        return id;
    }

    /**
     * The primary key for this dependency
     * @param id
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * The job that owns this dependency
     * @return
     */
    public VEGLJob getParent() {
        return parent;
    }

    /**
     * The job that owns this dependency
     * @param parent
     */
    public void setParent(VEGLJob parent) {
        this.parent = parent;
    }

    @Override
    public Object clone() {
        try {
            return super.clone();
        } catch (CloneNotSupportedException e) {
            return null;
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }

        if (obj == null) {
            return false;
        }

        if (!(obj instanceof VglDependency)) {
            return false;
        }

        return this.id.equals(((VglDependency)obj).id);
    }

    @Override
    public int hashCode() {
        return this.id.hashCode();
    }
}
