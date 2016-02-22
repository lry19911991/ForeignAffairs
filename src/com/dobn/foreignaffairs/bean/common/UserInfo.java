package com.dobn.foreignaffairs.bean.common;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;


@Entity
@Table(name="t_userinfo")
public class UserInfo {
	
	private Integer id;
	private String userName;
	private String userJob;
	private DeptInfo userDept_no;
	private String userDept_work;
	private String userPassword;
	private OfficeInfo userOffice;
	private String userTelephone;
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	public Integer getId() {
		return id;
	}
	
	@Column
	public String getUserName() {
		return userName;
	}
	
	@Column
	public String getUserJob() {
		return userJob;
	}
	
	@JoinColumn(name="userDeptno")
	@ManyToOne
	public DeptInfo getUserDept_no() {
		return userDept_no;
	}
	
	@Column
	public String getUserDept_work() {
		return userDept_work;
	}
	
	@Column
	public String getUserPassword() {
		return userPassword;
	}
	
	@JoinColumn
	@ManyToOne
	public OfficeInfo getUserOffice() {
		return userOffice;
	}
	
	@Column
	public String getUserTelephone() {
		return userTelephone;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public void setUserJob(String userJob) {
		this.userJob = userJob;
	}
	public void setUserDept_no(DeptInfo userDept_no) {
		this.userDept_no = userDept_no;
	}
	public void setUserDept_work(String userDept_work) {
		this.userDept_work = userDept_work;
	}
	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}
	public void setUserOffice(OfficeInfo userOffice) {
		this.userOffice = userOffice;
	}
	public void setUserTelephone(String userTelephone) {
		this.userTelephone = userTelephone;
	}



}
