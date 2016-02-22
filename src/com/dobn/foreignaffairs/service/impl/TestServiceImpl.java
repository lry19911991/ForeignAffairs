package com.dobn.foreignaffairs.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dobn.foreignaffairs.bean.Test;
import com.dobn.foreignaffairs.dao.TestDao;
import com.dobn.foreignaffairs.service.TestService;


@Service("testService")
public class TestServiceImpl implements TestService {

	@Autowired
	private TestDao testDao;

	public void insert(Test test) {
		// TODO Auto-generated method stub
		testDao.insert(test);
	}
	
}
