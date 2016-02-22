package com.dobn.foreignaffairs.dao.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.dobn.foreignaffairs.bean.Test;
import com.dobn.foreignaffairs.dao.BaseDao;
import com.dobn.foreignaffairs.dao.TestDao;

@Component("testDao")
public class TestDaoImpl implements TestDao {

	@Autowired
	private BaseDao<Test> baseDao;
	
	public void insert(Test test) {
		// TODO Auto-generated method stub
		try {
			baseDao.insert(test);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
