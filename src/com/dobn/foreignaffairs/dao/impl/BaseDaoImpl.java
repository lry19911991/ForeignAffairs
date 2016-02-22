package com.dobn.foreignaffairs.dao.impl;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.ScrollMode;
import org.hibernate.ScrollableResults;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.DetachedCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Component;

import com.dobn.foreignaffairs.dao.BaseDao;
import com.dobn.foreignaffairs.util.PageUtil;
import com.dobn.foreignaffairs.util.StaticUtil;

@Component("baseDao")
public class BaseDaoImpl<T> implements BaseDao<T> {
	private static final Logger logger = LoggerFactory.getLogger(BaseDaoImpl.class);

	@Autowired
	private SessionFactory sessionFactory;

	public void insert(T t) throws Exception {
		logger.info("insert -->" + t.getClass().getName());
		//hibernateTemplate.saveOrUpdate(t);
		//hibernateTemplate.evict(t);
		getHibernateSession().save(t);
	}
	public Session getHibernateSession(){
		return sessionFactory.getCurrentSession();
	}

	public void update(T t) throws Exception {
		getHibernateSession().merge(t);
	}

	public void delete(T t) throws Exception {
		getHibernateSession().delete(t);
	}

	@SuppressWarnings("unchecked")
	public List<T> queryByHql(String hql) {
		
		Query query=getHibernateSession().createQuery(hql);
		return (List<T>) hibernateTemplate.find(hql);
	}

	@SuppressWarnings("unchecked")
	public List<T> queryByDC(DetachedCriteria criteria) {
		return hibernateTemplate.findByCriteria(criteria);
	}

	// 根据id 查询
	public T queryById(Class<T> clazz, Serializable id) throws Exception {
		return (T) hibernateTemplate.get(clazz, id);
	}

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
	public PageUtil<T> queryByPager(final String hql, Map<String, Object> params) {
		// 执行HQL 表和列 类和属性
		// Query
		Query query = hibernateTemplate.execute(new HibernateCallback<Query>() {
			public Query doInHibernate(Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hql);
				return query;
			}
		});
		return this.handleQuery(query, params);
	}

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
	public PageUtil<T> queryByQuery(Query query, Map<String, Object> params) {
		return this.handleQuery(query, params);
	}

	@SuppressWarnings("unchecked")
	private PageUtil<T> handleQuery(Query query, Map<String, Object> params) {
		ScrollableResults results = query.scroll(ScrollMode.FORWARD_ONLY);
		int size;
		int curPage;
		if (params != null && params.containsKey(PageUtil.SIZE) && params.containsKey(PageUtil.CURPAGE)) {
			size = Integer.parseInt(params.get(PageUtil.SIZE).toString());
			curPage = Integer.parseInt(params.get(PageUtil.CURPAGE).toString());
		} else {
			size = StaticUtil.PAGESIZE;
			curPage = StaticUtil.DEFOUTPAGE;
		}
		List<T> data = new ArrayList<T>();
		int count = 0;
		if (curPage > 1) {
			results.setRowNumber((curPage - 1) * size - 1);
		}
		while (results.next()) {
			Object value = results.get(0);
			count++;
			data.add((T) value);
			if (count == size) {
				break;
			}
		}
		if (!results.isLast()) {
			results.last();
		}
		int total = results.getRowNumber() + 1;
		results.close();
		PageUtil<T> pager = new PageUtil<T>();
		pager.setData(data);
		pager.setTotal(total);
		return pager;

	}

	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}

	public HibernateTemplate getHibernateTemplate() {
		return hibernateTemplate;
	}

	@SuppressWarnings("deprecation")
	public Connection getConnection() {
		Connection con = null;
		try {

			Session curSeesion = null;

			curSeesion = getHibernateTemplate().getSessionFactory().getCurrentSession();
			con = curSeesion.connection();
			return con;
		} catch (Exception es) {
			es.printStackTrace();

		}
		return con;
	}
	
	public List<T> queryBySQL(String sql,Class<T> clazz){
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		
		SQLQuery query = session.createSQLQuery(sql);
		
		query.addEntity(clazz);
		
		return query.list();
	}
}
