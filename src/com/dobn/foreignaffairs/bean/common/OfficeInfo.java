package com.dobn.foreignaffairs.bean.common;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
/**
 * 组织机构表
 * @author Administrator
 *
 */
@Entity
@Table(name="companyinfo")
public class OfficeInfo {

	/**
	 * 主键（自增）
	 */
	private Integer id;
	/**
	 * 机构名称
	 */
	private String cname;
	/**
	 * 
	 */
	private Integer pid;
	/**
	 * 类型（1、公司；2、部门 ）
	 */
	private Integer type;
	/**
	 * 状态（0、可用；1、逻辑删除）
	 */
	private Integer flag;
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	public Integer getId() {
		return id;
	}
	@Column
	public String getCname() {
		return cname;
	}
	@Column
	public Integer getPid() {
		return pid;
	}
	@Column
	public Integer getType() {
		return type;
	}
	@Column
	public Integer getFlag() {
		return flag;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public void setCname(String cname) {
		this.cname = cname;
	}
	public void setPid(Integer pid) {
		this.pid = pid;
	}
	public void setType(Integer type) {
		this.type = type;
	}
	public void setFlag(Integer flag) {
		this.flag = flag;
	}
	
	
}
