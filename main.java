/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package himalayareports;

import java.sql.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
public class main {

    
    public static void main(String[] args) {
        
        List<String> Uids = new ArrayList<String>();
        
        try{
            String getUsers = "SELECT U.UID FROM Users U ";
            
            Connection con = DriverManager.getConnection("jdbc:mysql://sql9.freemysqlhosting.net:3306/sql9161597", "sql9161597", "YPk6CC3RBb");
            Statement st = con.createStatement();
           
            ResultSet rs3 = st.executeQuery("SELECT U.name, U.address, U.email, U.phone, "
                    + "U.age, U.gender, U.income FROM Users U ");
        
            String c1 = "Name";
            String c2 = "Address";
            String c3 = "Email";
            String c4 = "Phone";
            String c5 = "Age";
            String c6 = "Gender";
            String c7 = "Income";
        
            System.out.printf("Auto Generated Telemarketing Report For Himalaya.com\n\n");
            System.out.printf("%-18s %-18s %-25s %-15s %-8s %-10s %-10s\n", c1, c2, c3,
                    c4, c5, c6, c7);
            
            while (rs3.next()) {
                String name = rs3.getString(1);
                String address = rs3.getString(2);
                String email = rs3.getString(3);
                String phone = rs3.getString(4);
                String age = rs3.getString(5);
                String gender = rs3.getString(6);
                String income = rs3.getString(7);
            
                System.out.printf("%-18s %-18s %-25s %-15s %-8s %-10s %-10s\n", 
                        name, address, email, phone, age, gender, income);
            }        
            
            ResultSet rs2 = st.executeQuery("SELECT s.shipID, s.totalCost, s.creditCardNumber, s.status FROM Shipments s ");
            
            String c8 = "shipID";
            String c9 = "totalCost";
            String c10 = "creditCardNumber";
            String c11 = "status";
            
            System.out.printf("\nAuto Generated Sale Report \n \n");
            System.out.printf("%-10s %-18s %-18s %-18s\n", c8, c9, c10, c11);
            
            while(rs2.next()){
            
                String shipID = rs2.getString(1);
                String totalCost = rs2.getString(2);
                String creditCardNumber = rs2.getString(3);
                String status = rs2.getString(4);
                
                System.out.printf("%-10s $%-18s  %-18s %-18s\n", shipID, totalCost, creditCardNumber, status);
        }
            
            
           
            con.close();
        }
                    
        catch (SQLException ex) {
        // handle any errors
        System.out.println("SQLException: " + ex.getMessage());
        System.out.println("SQLState: " + ex.getSQLState());
        System.out.println("VendorError: " + ex.getErrorCode());
        }
        
    }
    
}
