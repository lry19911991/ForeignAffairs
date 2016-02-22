package com.dobn.foreignaffairs.service.common.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.dobn.foreignaffairs.bean.common.OfficeInfo;
import com.dobn.foreignaffairs.dao.common.CompanyInfoDao;

public interface CompanyInfoService {

	@Autowired
	public abstract void setCompanyInfoDao(CompanyInfoDao companyInfoDao);

	public abstract List<OfficeInfo> selectCompanyInfoList(
			Map<String, Object> map);

}