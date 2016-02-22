package com.dobn.foreignaffairs.service.statistics;

import java.util.List;
import java.util.Map;

import com.dobn.foreignaffairs.bean.statistics.CostResult;

public interface ExcelOptionService {

	public List<CostResult> selectCostResult(Map<String,Object> map);
}
