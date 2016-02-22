package com.dobn.foreignaffairs.dao.statistics;

import java.util.List;

import com.dobn.foreignaffairs.bean.statistics.CostResult;

public interface ExcelOptionDao {

	public List<CostResult> selectCostResult(String sql);
}
