package com.dobn.foreignaffairs.dao.statistics.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.dobn.foreignaffairs.bean.statistics.CostResult;
import com.dobn.foreignaffairs.dao.BaseDao;
import com.dobn.foreignaffairs.dao.statistics.ExcelOptionDao;

@Component("excelOptionDao")
public class ExcelOptionDaoImpl implements ExcelOptionDao {
	
	@Autowired
	private BaseDao<CostResult> baseDao;
	
	public List<CostResult> selectCostResult(String sql) {
		// TODO Auto-generated method stub
		
		return baseDao.queryBySQL(sql, CostResult.class);
	}

}
