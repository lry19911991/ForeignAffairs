package com.dobn.foreignaffairs.bean.common;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="t_dept")
public class DeptInfo {
	private Integer id;
	private String deptName;
	private String workName;

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	public Integer getId() {
		return id;
	}

	
	@Column
	public String getDeptName() {
		return deptName;
	}

	
	@Column
	public String getWorkName() {
		return workName;
	}

	public void setId(Integer deptId) {
		this.id = deptId;
	}

	public void setDeptName(String deptName) {
		this.deptName = deptName;
	}

	public void setWorkName(String workName) {
		this.workName = workName;
	}

}
