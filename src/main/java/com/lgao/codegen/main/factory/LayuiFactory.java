package com.lgao.codegen.main.factory;


import com.lgao.codegen.main.entitys.LayuiEntity;

/**
 * @author lgao
 * @version sjv2
 * @des
 * @date 2021/9/29 11:50
 */
public class LayuiFactory {
    public static LayuiEntity genLayuiEntity(Object res){
        LayuiEntity entity = new LayuiEntity();
        entity.setData(res);
        return entity;
    }
}
