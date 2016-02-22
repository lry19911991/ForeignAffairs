package com.dobn.foreignaffairs.dao.common.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.dobn.foreignaffairs.bean.common.OfficeInfo;
import com.dobn.foreignaffairs.dao.BaseDao;
import com.dobn.foreignaffairs.dao.common.CompanyInfoDao;

@Component("companyInfoDao")
@Transactional
public class CompanyInfoDaoImpl implements CompanyInfoDao {
	
	@Autowired
	private BaseDao<OfficeInfo> baseDao;
	
	/* (non-Javadoc)
	 * @see com.dobn.foreignaffairs.dao.common.impl.CompanyInfoDao#selectCompanyInfoList(java.util.Map)
	 */
	public void setBaseDao(BaseDao<OfficeInfo> baseDao) {
		this.baseDao = baseDao;
	}



	public List<OfficeInfo> selectCompanyInfoList(Map<String,Object> map) {
		String hql="from CompanyInfo where 1=1";
		if (!map.isEmpty()) {
			if(map.containsKey("CompanyInfo.type")){
				hql+=" and type="+map.get("CompanyInfo.type");
			}
			if(map.containsKey("CompanyInfo.flag")){
				hql+=" and flag="+map.get("CompanyInfo.flag");
			}
			
		}
		return baseDao.queryByHql(hql);
	}
	public void insertCompanyInfo(){
		OfficeInfo c=new OfficeInfo();
		c.setCname("abc");
		c.setFlag(1);
		c.setId(5);
		c.setPid(2);
		c.setType(2);
			try {
				baseDao.insert(c);
			} catch (Exception e) {}

	}}
