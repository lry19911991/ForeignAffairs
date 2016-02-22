package com.dobn.foreignaffairs.service.common;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dobn.foreignaffairs.bean.common.OfficeInfo;
import com.dobn.foreignaffairs.dao.common.CompanyInfoDao;
import com.dobn.foreignaffairs.service.common.impl.CompanyInfoService;

@Service("companyInfoService")
public class CompanyInfoServiceImpl implements CompanyInfoService {
	private CompanyInfoDao companyInfoDao;
	/* (non-Javadoc)
	 * @see com.dobn.foreignaffairs.service.common.impl.CompanyInfoService#setCompanyInfoDao(com.dobn.foreignaffairs.dao.common.CompanyInfoDao)
	 */
	@Autowired
	public void setCompanyInfoDao(CompanyInfoDao companyInfoDao) {
		this.companyInfoDao = companyInfoDao;
	}
	/* (non-Javadoc)
	 * @see com.dobn.foreignaffairs.service.common.impl.CompanyInfoService#selectCompanyInfoList(java.util.Map)
	 */
	public List<OfficeInfo> selectCompanyInfoList(Map<String, Object> map) {
		return companyInfoDao.selectCompanyInfoList(map);
	}
}
