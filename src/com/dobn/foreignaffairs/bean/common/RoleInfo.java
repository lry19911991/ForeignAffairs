package com.dobn.foreignaffairs.bean.common;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;


@Entity
@Table(name="t_role")
public class RoleInfo {
	private Integer id;
	private String role_name;
	private String role_note;
	
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Id
	public Integer getId() {
		return id;
	}
	public void setId(Integer role_id) {
		this.id = role_id;
	}
	
	@Column
	public String getRole_name() {
		return role_name;
	}
	public void setRole_name(String role_name) {
		this.role_name = role_name;
	}
	@Column
	public String getRole_note() {
		return role_note;
	}
	public void setRole_note(String role_note) {
		this.role_note = role_note;
	}

}
