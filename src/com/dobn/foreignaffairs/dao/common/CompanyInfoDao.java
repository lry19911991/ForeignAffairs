package com.dobn.foreignaffairs.dao.common;

import java.util.List;
import java.util.Map;

import com.dobn.foreignaffairs.bean.common.OfficeInfo;

public interface CompanyInfoDao {

	public abstract List<OfficeInfo> selectCompanyInfoList(Map<String, Object> map);

	public abstract void insertCompanyInfo();

}