package com.dobn.foreignaffairs.util;

import java.util.ArrayList;
import java.util.List;

/**
 * 分页属性工具类
 * @author sunjun
 *
 * @param <T>
 */
public class PageUtil<T> {
	// 分页静态不变属性
	public static final String SIZE = "size";
	public static final String CURPAGE = "curPage";

	private long total;
	private List<T> data = new ArrayList<T>();

	public long getTotal() {
		return total;
	}

	public void setTotal(long total) {
		this.total = total;
	}

	public List<T> getData() {
		return data;
	}

	public void setData(List<T> data) {
		this.data = data;
	}

	@Override
	public String toString() {
		return "PageUtil [data=" + data + ", total=" + total + "]";
	}
}
