package com.dobn.foreignaffairs.bean.common;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="t_user_role")
public class UserRoleInfo {

	private UserRoleInfo userId;
	
	private RoleInfo roleId;
	
	
	private Integer id;

	@ManyToOne
	@JoinColumn
	public UserRoleInfo getUserId() {
		return userId;
	}

	
	@ManyToOne
	@JoinColumn
	public RoleInfo getRoleId() {
		return roleId;
	}

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	public Integer getId() {
		return id;
	}

	public void setUserId(UserRoleInfo userId) {
		this.userId = userId;
	}

	public void setRoleId(RoleInfo roleId) {
		this.roleId = roleId;
	}

	public void setId(Integer id) {
		this.id = id;
	}
	
	
}
