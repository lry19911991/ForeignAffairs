package com.dobn.foreignaffairs.dao;

import java.io.Serializable;
import java.sql.Connection;
import java.util.List;
import java.util.Map;

import org.hibernate.Query;
import org.hibernate.criterion.DetachedCriteria;
import org.springframework.orm.hibernate3.HibernateTemplate;

import com.dobn.foreignaffairs.util.PageUtil;

public interface BaseDao<T> {

	public void insert(T t) throws Exception ;

	public void update(T t) throws Exception;

	public void delete(T t) throws Exception ;
	
	public List<T> queryByHql(String hql);
	
	public List<T> queryByDC(DetachedCriteria criteria);
	// 根据id 查询
	public T queryById(Class<T> clazz, Serializable id) throws Exception;

	/**
	 * <b>queryByPager:分页查询</b>
	 * <p>
	 * <b> 行数size 目前页数 curPage Map</b>
	 * </p>
	 * <!-- 在此添加详细说明 -->
	 * 
	 * @param hql
	 * @param params
	 * @return
	 */
	public PageUtil<T> queryByPager(final String hql, Map<String, Object> params) ;

	/**
	 * <b>queryByPager。</b>
	 * <p>
	 * <b>根据自定义的query 对象 操作游标返回对象</b>
	 * </p>
	 * <!-- 在此添加详细说明 --> 无。
	 * 
	 * @param query
	 * @param params
	 * @return
	 */
	public PageUtil<T> queryByQuery(Query query, Map<String, Object> params);

	public void setHibernateTemplate(HibernateTemplate hibernateTemplate);

	public HibernateTemplate getHibernateTemplate();
	
	public Connection getConnection();
	
	public List<T> queryBySQL(String sql,Class<T> clazz);
	
}