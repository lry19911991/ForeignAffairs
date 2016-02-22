package com.dobn.foreignaffairs.util;

import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 日期工具类
 * @author sunjun
 *
 */
public class DateUtil {

	/**
	 * 格式化日期
	 * @param date
	 * @param pattern
	 * @return 字符串
	 */
	public static String formatDate(Date date,String pattern){
		if(!StringUtils.checkNullBool(pattern)){
			pattern ="yyyy-MM-dd hh:mm:ss";
		}
		SimpleDateFormat sdf = new SimpleDateFormat(pattern);
		return sdf.format(date);
	}
	/**
	 * 字符串转日期
	 * @param strDate
	 * @param pattern
	 * @return Date
	 */
	public static Date strToDate(String strDate,String pattern) {
		if(!StringUtils.checkNullBool(pattern)){
			pattern ="yyyy-MM-dd hh:mm:ss";
		}
	   SimpleDateFormat formatter = new SimpleDateFormat(pattern);
	   ParsePosition pos = new ParsePosition(0);
	   Date strtodate = formatter.parse(strDate, pos);
	   return strtodate;
	}
	public static void main(String[] args) {
		Date strToDate = DateUtil.strToDate("2012-03-13 09:32:43",null);
		System.out.println(strToDate);
		System.out.println(DateUtil.formatDate(strToDate, null));
		
	}
}
