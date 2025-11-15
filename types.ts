

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type activity_status = "Planned" | "Ongoing" | "Completed" | "Cancelled";
export type media_type = "Image" | "Video" | "Document";
export type attendance_status = "Present" | "Absent" | "Tardy" | "Excused";
export type employee_attendance_status = "Present" | "Absent" | "Excused";
export type task_status = "Pending" | "In Progress" | "Completed" | "On Hold";
export type task_priority = "Low" | "Medium" | "High" | "Urgent";
export type invoice_type = "Student" | "Employee" | "Other";
export type invoice_status = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
export type notification_type = "Message" | "Alert" | "Reminder" | "Update";
export type notification_priority = "Low" | "Normal" | "High";
export type gender_type = "Male" | "Female" | "Other";
export type service_type = "Monthly" | "Daily" | "Hourly" | "Other";
export type student_payment_method = "Cash" | "Transfer" | "Card" | "Other";
export type student_payment_status = "Pending" | "Paid" | "Partially Paid" | "Overdue";
export type teacher_payment_method = "Transfer" | "Check" | "Cash" | "Other";
export type teacher_payment_status = "Pending" | "Paid" | "Processing";


export interface Database {
  public: {
    Tables: {
      activity: {
        Row: {
          ActivityID: number
          Name: string
          Description: string | null
          GradeID: number | null
          EmpID: number | null
          ScheduledDate: string | null
          StartTime: string | null
          EndTime: string | null
          Location: string | null
          Category: string | null
          Status: activity_status | null
          ImagePath: string | null
          CreatedBy: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          ActivityID?: number
          Name: string
          Description?: string | null
          GradeID?: number | null
          EmpID?: number | null
          ScheduledDate?: string | null
          StartTime?: string | null
          EndTime?: string | null
          Location?: string | null
          Category?: string | null
          Status?: activity_status | null
          ImagePath?: string | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          ActivityID?: number
          Name?: string
          Description?: string | null
          GradeID?: number | null
          EmpID?: number | null
          ScheduledDate?: string | null
          StartTime?: string | null
          EndTime?: string | null
          Location?: string | null
          Category?: string | null
          Status?: activity_status | null
          ImagePath?: string | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_created_by"
            columns: ["CreatedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_activity_employee"
            columns: ["EmpID"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_activity_grade"
            columns: ["GradeID"]
            referencedRelation: "grade"
            referencedColumns: ["GradeID"]
          }
        ]
      }
      activity_media: {
        Row: {
          MediaID: number
          ActivityID: number
          MediaType: media_type
          FilePath: string
          FileSize: number | null
          Caption: string | null
          UploadedBy: number | null
          CreatedAt: string
        }
        Insert: {
          MediaID?: number
          ActivityID: number
          MediaType?: media_type
          FilePath: string
          FileSize?: number | null
          Caption?: string | null
          UploadedBy?: number | null
          CreatedAt?: string
        }
        Update: {
          MediaID?: number
          ActivityID?: number
          MediaType?: media_type
          FilePath?: string
          FileSize?: number | null
          Caption?: string | null
          UploadedBy?: number | null
          CreatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_media_activity"
            columns: ["ActivityID"]
            referencedRelation: "activity"
            referencedColumns: ["ActivityID"]
          },
          {
            foreignKeyName: "fk_activity_media_uploaded_by"
            columns: ["UploadedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      attendance: {
        Row: {
          AttendanceID: number
          StudentID: number
          Date: string
          CheckInTime: string | null
          CheckOutTime: string | null
          Status: attendance_status
          IsLate: number | null
          LateMinutes: number | null
          Notes: string | null
          CheckedInBy: number | null
          CheckedOutBy: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          AttendanceID?: number
          StudentID: number
          Date: string
          CheckInTime?: string | null
          CheckOutTime?: string | null
          Status?: attendance_status
          IsLate?: number | null
          LateMinutes?: number | null
          Notes?: string | null
          CheckedInBy?: number | null
          CheckedOutBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          AttendanceID?: number
          StudentID?: number
          Date?: string
          CheckInTime?: string | null
          CheckOutTime?: string | null
          Status?: attendance_status
          IsLate?: number | null
          LateMinutes?: number | null
          Notes?: string | null
          CheckedInBy?: number | null
          CheckedOutBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendance_checked_in_by"
            columns: ["CheckedInBy"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_attendance_checked_out_by"
            columns: ["CheckedOutBy"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_attendance_student"
            columns: ["StudentID"]
            referencedRelation: "student"
            referencedColumns: ["StudentID"]
          }
        ]
      }
      employee_attendance: {
        Row: {
            AttendanceID: number;
            EmpID: number;
            Date: string;
            CheckInTime: string | null;
            CheckOutTime: string | null;
            Status: employee_attendance_status;
            Notes: string | null;
            UpdatedBy: number | null;
            CreatedAt: string;
            UpdatedAt: string | null;
        }
        Insert: {
            AttendanceID?: number;
            EmpID: number;
            Date: string;
            CheckInTime?: string | null;
            CheckOutTime?: string | null;
            Status: employee_attendance_status;
            Notes?: string | null;
            UpdatedBy?: number | null;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Update: {
            AttendanceID?: number;
            EmpID?: number;
            Date?: string;
            CheckInTime?: string | null;
            CheckOutTime?: string | null;
            Status?: employee_attendance_status;
            Notes?: string | null;
            UpdatedBy?: number | null;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Relationships: [
            {
                foreignKeyName: "fk_employee_attendance_employee"
                columns: ["EmpID"]
                referencedRelation: "employee"
                referencedColumns: ["EmpID"]
            },
            {
                foreignKeyName: "fk_employee_attendance_updated_by"
                columns: ["UpdatedBy"]
                referencedRelation: "user"
                referencedColumns: ["UserID"]
            }
        ]
      }
      audit_log: {
        Row: {
          LogID: number
          UserID: number | null
          Action: string
          TableName: string | null
          RecordID: number | null
          OldData: Json | null
          NewData: Json | null
          IPAddress: string | null
          UserAgent: string | null
          CreatedAt: string
        }
        Insert: {
          LogID?: number
          UserID?: number | null
          Action: string
          TableName?: string | null
          RecordID?: number | null
          OldData?: Json | null
          NewData?: Json | null
          IPAddress?: string | null
          UserAgent?: string | null
          CreatedAt?: string
        }
        Update: {
          LogID?: number
          UserID?: number | null
          Action?: string
          TableName?: string | null
          RecordID?: number | null
          OldData?: Json | null
          NewData?: Json | null
          IPAddress?: string | null
          UserAgent?: string | null
          CreatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_log_user"
            columns: ["UserID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      company_profile: {
        Row: {
            ProfileID: number;
            CompanyName: string;
            RUC: string | null;
            Address: string | null;
            PhoneNumber: string | null;
            Email: string | null;
            SRIAuthorization: string | null;
            LogoURL: string | null;
            CreatedAt: string;
            UpdatedAt: string | null;
        }
        Insert: {
            ProfileID?: number;
            CompanyName: string;
            RUC?: string | null;
            Address?: string | null;
            PhoneNumber?: string | null;
            Email?: string | null;
            SRIAuthorization?: string | null;
            LogoURL?: string | null;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Update: {
            ProfileID?: number;
            CompanyName?: string;
            RUC?: string | null;
            Address?: string | null;
            PhoneNumber?: string | null;
            Email?: string | null;
            SRIAuthorization?: string | null;
            LogoURL?: string | null;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Relationships: []
      }
      employee: {
        Row: {
          EmpID: number
          FirstName: string
          LastName: string
          DocumentNumber: string | null
          Position: string
          Email: string | null
          PhoneNumber: string | null
          Address: string | null
          HireDate: string | null
          TerminationDate: string | null
          Salary: number | null
          BankAccount: string | null
          EmergencyContact: string | null
          EmergencyPhone: string | null
          Qualifications: string | null
          ProfilePicture: string | null
          IsActive: number
          UserID: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          EmpID?: number
          FirstName: string
          LastName: string
          DocumentNumber?: string | null
          Position: string
          Email?: string | null
          PhoneNumber?: string | null
          Address?: string | null
          HireDate?: string | null
          TerminationDate?: string | null
          Salary?: number | null
          BankAccount?: string | null
          EmergencyContact?: string | null
          EmergencyPhone?: string | null
          Qualifications?: string | null
          ProfilePicture?: string | null
          IsActive?: number
          UserID?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          EmpID?: number
          FirstName?: string
          LastName?: string
          DocumentNumber?: string | null
          Position?: string
          Email?: string | null
          PhoneNumber?: string | null
          Address?: string | null
          HireDate?: string | null
          TerminationDate?: string | null
          Salary?: number | null
          BankAccount?: string | null
          EmergencyContact?: string | null
          EmergencyPhone?: string | null
          Qualifications?: string | null
          ProfilePicture?: string | null
          IsActive?: number
          UserID?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_user"
            columns: ["UserID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      employee_task: {
        Row: {
          TaskID: number
          EmpID: number
          TaskName: string
          Description: string | null
          DueDate: string | null
          Status: task_status | null
          Priority: task_priority | null
          CompletedDate: string | null
          CreatedBy: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          TaskID?: number
          EmpID: number
          TaskName: string
          Description?: string | null
          DueDate?: string | null
          Status?: task_status | null
          Priority?: task_priority | null
          CompletedDate?: string | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          TaskID?: number
          EmpID?: number
          TaskName?: string
          Description?: string | null
          DueDate?: string | null
          Status?: task_status | null
          Priority?: task_priority | null
          CompletedDate?: string | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_task_created_by"
            columns: ["CreatedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_employee_task_employee"
            columns: ["EmpID"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          }
        ]
      }
      grade: {
        Row: {
          GradeID: number
          GradeName: string
          Description: string | null
          AgeRangeMin: number | null
          AgeRangeMax: number | null
          MaxCapacity: number | null
          IsActive: number
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          GradeID?: number
          GradeName: string
          Description?: string | null
          AgeRangeMin?: number | null
          AgeRangeMax?: number | null
          MaxCapacity?: number | null
          IsActive?: number
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          GradeID?: number
          GradeName?: string
          Description?: string | null
          AgeRangeMin?: number | null
          AgeRangeMax?: number | null
          MaxCapacity?: number | null
          IsActive?: number
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: []
      }
      guardian: {
        Row: {
          GuardianID: number
          FirstName: string
          LastName: string
          DocumentNumber: string | null
          Relationship: string
          PhoneNumber: string | null
          Email: string | null
          Address: string | null
          Occupation: string | null
          WorkPhone: string | null
          IsEmergencyContact: number | null
          IsAuthorizedPickup: number | null
          UserID: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          GuardianID?: number
          FirstName: string
          LastName: string
          DocumentNumber?: string | null
          Relationship: string
          PhoneNumber?: string | null
          Email?: string | null
          Address?: string | null
          Occupation?: string | null
          WorkPhone?: string | null
          IsEmergencyContact?: number | null
          IsAuthorizedPickup?: number | null
          UserID?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          GuardianID?: number
          FirstName?: string
          LastName?: string
          DocumentNumber?: string | null
          Relationship?: string
          PhoneNumber?: string | null
          Email?: string | null
          Address?: string | null
          Occupation?: string | null
          WorkPhone?: string | null
          IsEmergencyContact?: number | null
          IsAuthorizedPickup?: number | null
          UserID?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_guardian_user"
            columns: ["UserID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      invoice: {
        Row: {
            InvoiceID: number;
            StudentPaymentID: number;
            Sequential: string;
            AuthorizationNumber: string | null;
            AccessKey: string | null;
            IssueDate: string;
            Subtotal: number;
            TaxAmount: number;
            TotalAmount: number;
            CustomerName: string;
            CustomerIdentifier: string;
            CustomerAddress: string;
            Status: invoice_status;
            CreatedAt: string;
            UpdatedAt: string | null;
        }
        Insert: {
            InvoiceID?: number;
            StudentPaymentID: number;
            Sequential: string;
            AuthorizationNumber?: string | null;
            AccessKey?: string | null;
            IssueDate: string;
            Subtotal: number;
            TaxAmount?: number;
            TotalAmount: number;
            CustomerName: string;
            CustomerIdentifier: string;
            CustomerAddress: string;
            Status: invoice_status;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Update: {
            InvoiceID?: number;
            StudentPaymentID?: number;
            Sequential?: string;
            AuthorizationNumber?: string | null;
            AccessKey?: string | null;
            IssueDate?: string;
            Subtotal?: number;
            TaxAmount?: number;
            TotalAmount?: number;
            CustomerName?: string;
            CustomerIdentifier?: string;
            CustomerAddress?: string;
            Status?: invoice_status;
            CreatedAt?: string;
            UpdatedAt?: string | null;
        }
        Relationships: [
            {
                foreignKeyName: "fk_invoice_student_payment"
                columns: ["StudentPaymentID"]
                referencedRelation: "student_payment"
                referencedColumns: ["StudentPaymentID"]
            }
        ]
      }
      notification: {
        Row: {
          NotificationID: number
          SenderID: number | null
          ReceiverID: number
          Type: notification_type
          Priority: notification_priority | null
          Subject: string | null
          Message: string
          IsRead: number | null
          ReadAt: string | null
          RelatedModule: string | null
          RelatedID: number | null
          ExpiresAt: string | null
          CreatedAt: string
        }
        Insert: {
          NotificationID?: number
          SenderID?: number | null
          ReceiverID: number
          Type?: notification_type
          Priority?: notification_priority | null
          Subject?: string | null
          Message: string
          IsRead?: number | null
          ReadAt?: string | null
          RelatedModule?: string | null
          RelatedID?: number | null
          ExpiresAt?: string | null
          CreatedAt?: string
        }
        Update: {
          NotificationID?: number
          SenderID?: number | null
          ReceiverID?: number
          Type?: notification_type
          Priority?: notification_priority | null
          Subject?: string | null
          Message?: string
          IsRead?: number | null
          ReadAt?: string | null
          RelatedModule?: string | null
          RelatedID?: number | null
          ExpiresAt?: string | null
          CreatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_receiver"
            columns: ["ReceiverID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_notification_sender"
            columns: ["SenderID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      permission: {
        Row: {
          PermissionID: number
          PermissionName: string
          Module: string
          Action: string
          Description: string | null
          CreatedAt: string
          Link: string | null
          Icon: string | null
        }
        Insert: {
          PermissionID?: number
          PermissionName: string
          Module: string
          Action: string
          Description?: string | null
          CreatedAt?: string
          Link?: string | null
          Icon?: string | null
        }
        Update: {
          PermissionID?: number
          PermissionName?: string
          Module?: string
          Action?: string
          Description?: string | null
          CreatedAt?: string
          Link?: string | null
          Icon?: string | null
        }
        Relationships: []
      }
      role: {
        Row: {
          RoleID: number
          RoleName: string
          Description: string | null
          IsActive: number
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          RoleID?: number
          RoleName: string
          Description?: string | null
          IsActive?: number
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          RoleID?: number
          RoleName?: string
          Description?: string | null
          IsActive?: number
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: []
      }
      role_permission: {
        Row: {
          RolePermissionID: number
          RoleID: number
          PermissionID: number
          GrantedAt: string
        }
        Insert: {
          RolePermissionID?: number
          RoleID: number
          PermissionID: number
          GrantedAt?: string
        }
        Update: {
          RolePermissionID?: number
          RoleID?: number
          PermissionID?: number
          GrantedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_role_permission_permission"
            columns: ["PermissionID"]
            referencedRelation: "permission"
            referencedColumns: ["PermissionID"]
          },
          {
            foreignKeyName: "fk_role_permission_role"
            columns: ["RoleID"]
            referencedRelation: "role"
            referencedColumns: ["RoleID"]
          }
        ]
      }
      session: {
        Row: {
          SessionID: number
          UserID: number
          Token: string
          IPAddress: string | null
          UserAgent: string | null
          ExpiresAt: string
          CreatedAt: string
        }
        Insert: {
          SessionID?: number
          UserID: number
          Token: string
          IPAddress?: string | null
          UserAgent?: string | null
          ExpiresAt: string
          CreatedAt?: string
        }
        Update: {
          SessionID?: number
          UserID?: number
          Token?: string
          IPAddress?: string | null
          UserAgent?: string | null
          ExpiresAt?: string
          CreatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_user"
            columns: ["UserID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      student: {
        Row: {
          StudentID: number
          FirstName: string
          LastName: string
          BirthDate: string
          Gender: gender_type | null
          DocumentNumber: string | null
          Address: string | null
          Email: string | null
          PhoneNumber: string | null
          GradeID: number | null
          GuardianID: number | null
          ProfilePicture: string | null
          MedicalInfo: string | null
          EmergencyContact: string | null
          EmergencyPhone: string | null
          IsActive: number
          IsRecurrent: number
          EnrollmentDate: string | null
          WithdrawalDate: string | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          StudentID?: number
          FirstName: string
          LastName: string
          BirthDate: string
          Gender?: gender_type | null
          DocumentNumber?: string | null
          Address?: string | null
          Email?: string | null
          PhoneNumber?: string | null
          GradeID?: number | null
          GuardianID?: number | null
          ProfilePicture?: string | null
          MedicalInfo?: string | null
          EmergencyContact?: string | null
          EmergencyPhone?: string | null
          IsActive?: number
          IsRecurrent?: number
          EnrollmentDate?: string | null
          WithdrawalDate?: string | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          StudentID?: number
          FirstName?: string
          LastName?: string
          BirthDate?: string
          Gender?: gender_type | null
          DocumentNumber?: string | null
          Address?: string | null
          Email?: string | null
          PhoneNumber?: string | null
          GradeID?: number | null
          GuardianID?: number | null
          ProfilePicture?: string | null
          MedicalInfo?: string | null
          EmergencyContact?: string | null
          EmergencyPhone?: string | null
          IsActive?: number
          IsRecurrent?: number
          EnrollmentDate?: string | null
          WithdrawalDate?: string | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_grade"
            columns: ["GradeID"]
            referencedRelation: "grade"
            referencedColumns: ["GradeID"]
          },
          {
            foreignKeyName: "student_GuardianID_fkey"
            columns: ["GuardianID"]
            referencedRelation: "guardian"
            referencedColumns: ["GuardianID"]
          }
        ]
      }
      student_guardian: {
        Row: {
          StudentGuardianID: number
          StudentID: number
          GuardianID: number
          IsPrimary: number | null
          Priority: number | null
          CreatedAt: string
        }
        Insert: {
          StudentGuardianID?: number
          StudentID: number
          GuardianID: number
          IsPrimary?: number | null
          Priority?: number | null
          CreatedAt?: string
        }
        Update: {
          StudentGuardianID?: number
          StudentID?: number
          GuardianID?: number
          IsPrimary?: number | null
          Priority?: number | null
          CreatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_guardian_guardian"
            columns: ["GuardianID"]
            referencedRelation: "guardian"
            referencedColumns: ["GuardianID"]
          },
          {
            foreignKeyName: "fk_student_guardian_student"
            columns: ["StudentID"]
            referencedRelation: "student"
            referencedColumns: ["StudentID"]
          }
        ]
      }
      student_observation: {
        Row: {
          ObservationID: number
          StudentID: number
          EmpID: number
          ObservationDate: string
          Category: string | null
          Observation: string
          IsPositive: number | null
          RequiresAction: number | null
          ActionTaken: string | null
          IsPrivate: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          ObservationID?: number
          StudentID: number
          EmpID: number
          ObservationDate: string
          Category?: string | null
          Observation: string
          IsPositive?: number | null
          RequiresAction?: number | null
          ActionTaken?: string | null
          IsPrivate?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          ObservationID?: number
          StudentID?: number
          EmpID?: number
          ObservationDate?: string
          Category?: string | null
          Observation?: string
          IsPositive?: number | null
          RequiresAction?: number | null
          ActionTaken?: string | null
          IsPrivate?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_observation_employee"
            columns: ["EmpID"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_observation_student"
            columns: ["StudentID"]
            referencedRelation: "student"
            referencedColumns: ["StudentID"]
          }
        ]
      }
      student_payment: {
        Row: {
          StudentPaymentID: number
          StudentID: number
          ServiceType: service_type
          Hours: number | null
          RatePerHour: number | null
          MonthlyFee: number | null
          DailyFee: number | null
          TotalAmount: number
          PaidAmount: number | null
          BalanceRemaining: number | null
          PaymentDate: string | null
          DueDate: string
          PaymentMethod: student_payment_method | null
          Status: student_payment_status
          IsRecurrent: number | null
          StartDate: string | null
          EndDate: string | null
          InvoiceNumber: string | null
          TransactionReference: string | null
          Notes: string | null
          ProcessedBy: number | null
          CreatedBy: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          StudentPaymentID?: number
          StudentID: number
          ServiceType?: service_type
          Hours?: number | null
          RatePerHour?: number | null
          MonthlyFee?: number | null
          DailyFee?: number | null
          TotalAmount: number
          PaidAmount?: number | null
          BalanceRemaining?: number | null
          PaymentDate?: string | null
          DueDate: string
          PaymentMethod?: student_payment_method | null
          Status?: student_payment_status
          IsRecurrent?: number | null
          StartDate?: string | null
          EndDate?: string | null
          InvoiceNumber?: string | null
          TransactionReference?: string | null
          Notes?: string | null
          ProcessedBy?: number | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          StudentPaymentID?: number
          StudentID?: number
          ServiceType?: service_type
          Hours?: number | null
          RatePerHour?: number | null
          MonthlyFee?: number | null
          DailyFee?: number | null
          TotalAmount?: number
          PaidAmount?: number | null
          BalanceRemaining?: number | null
          PaymentDate?: string | null
          DueDate?: string
          PaymentMethod?: student_payment_method | null
          Status?: student_payment_status
          IsRecurrent?: number | null
          StartDate?: string | null
          EndDate?: string
          InvoiceNumber?: string | null
          TransactionReference?: string | null
          Notes?: string | null
          ProcessedBy?: number | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_payment_created_by"
            columns: ["CreatedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_student_payment_processed_by"
            columns: ["ProcessedBy"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_student_payment_student"
            columns: ["StudentID"]
            referencedRelation: "student"
            referencedColumns: ["StudentID"]
          }
        ]
      }
      teacher_payment: {
        Row: {
          TeacherPaymentID: number
          EmpID: number
          PaymentPeriod: string
          PeriodStartDate: string
          PeriodEndDate: string
          BaseSalary: number
          Bonuses: number | null
          Overtime: number | null
          Deductions: number | null
          TotalAmount: number
          PaymentDate: string
          PaymentMethod: teacher_payment_method
          Status: teacher_payment_status
          TransactionReference: string | null
          Notes: string | null
          ProcessedBy: number | null
          CreatedBy: number | null
          CreatedAt: string
          UpdatedAt: string | null
        }
        Insert: {
          TeacherPaymentID?: number
          EmpID: number
          PaymentPeriod: string
          PeriodStartDate: string
          PeriodEndDate: string
          BaseSalary: number
          Bonuses?: number | null
          Overtime?: number | null
          Deductions?: number | null
          TotalAmount: number
          PaymentDate: string
          PaymentMethod?: teacher_payment_method
          Status?: teacher_payment_status
          TransactionReference?: string | null
          Notes?: string | null
          ProcessedBy?: number | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Update: {
          TeacherPaymentID?: number
          EmpID?: number
          PaymentPeriod?: string
          PeriodStartDate?: string
          PeriodEndDate?: string
          BaseSalary?: number
          Bonuses?: number | null
          Overtime?: number | null
          Deductions?: number | null
          TotalAmount?: number
          PaymentDate?: string
          PaymentMethod?: teacher_payment_method
          Status?: teacher_payment_status
          TransactionReference?: string | null
          Notes?: string | null
          ProcessedBy?: number | null
          CreatedBy?: number | null
          CreatedAt?: string
          UpdatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_payment_created_by"
            columns: ["CreatedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_teacher_payment_employee"
            columns: ["EmpID"]
            referencedRelation: "employee"
            referencedColumns: ["EmpID"]
          },
          {
            foreignKeyName: "fk_teacher_payment_processed_by"
            columns: ["ProcessedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
      user: {
        Row: {
          UserID: number
          UserName: string
          PasswordHash: string | null
          Email: string
          FirstName: string | null
          LastName: string | null
          Phone: string | null
          Address: string | null
          IsActive: number
          LastLogin: string | null
          PasswordResetToken: string | null
          PasswordResetExpires: string | null
          CreatedAt: string
          UpdatedAt: string | null
          AuthUserID: string | null
        }
        Insert: {
          UserID?: number
          UserName: string
          PasswordHash?: string | null
          Email: string
          FirstName?: string | null
          LastName?: string | null
          Phone?: string | null
          Address?: string | null
          IsActive?: number
          LastLogin?: string | null
          PasswordResetToken?: string | null
          PasswordResetExpires?: string | null
          CreatedAt?: string
          UpdatedAt?: string | null
          AuthUserID?: string | null
        }
        Update: {
          UserID?: number
          UserName?: string
          PasswordHash?: string | null
          Email?: string
          FirstName?: string | null
          LastName?: string | null
          Phone?: string | null
          Address?: string | null
          IsActive?: number
          LastLogin?: string | null
          PasswordResetToken?: string | null
          PasswordResetExpires?: string | null
          CreatedAt?: string
          UpdatedAt?: string | null
          AuthUserID?: string | null
        }
        Relationships: []
      }
      user_role: {
        Row: {
          UserRoleID: number
          UserID: number
          RoleID: number
          AssignedAt: string
          AssignedBy: number | null
        }
        Insert: {
          UserRoleID?: number
          UserID: number
          RoleID: number
          AssignedAt?: string
          AssignedBy?: number | null
        }
        Update: {
          UserRoleID?: number
          UserID?: number
          RoleID?: number
          AssignedAt?: string
          AssignedBy?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_role_assigned_by"
            columns: ["AssignedBy"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          },
          {
            foreignKeyName: "fk_user_role_role"
            columns: ["RoleID"]
            referencedRelation: "role"
            referencedColumns: ["RoleID"]
          },
          {
            foreignKeyName: "fk_user_role_user"
            columns: ["UserID"]
            referencedRelation: "user"
            referencedColumns: ["UserID"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_status: "Planned" | "Ongoing" | "Completed" | "Cancelled"
      media_type: "Image" | "Video" | "Document"
      attendance_status: "Present" | "Absent" | "Tardy" | "Excused"
      employee_attendance_status: "Present" | "Absent" | "Excused"
      task_status: "Pending" | "In Progress" | "Completed" | "On Hold"
      task_priority: "Low" | "Medium" | "High" | "Urgent"
      invoice_type: "Student" | "Employee" | "Other"
      invoice_status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
      notification_type: "Message" | "Alert" | "Reminder" | "Update"
      notification_priority: "Low" | "Normal" | "High"
      gender_type: "Male" | "Female" | "Other"
      service_type: "Monthly" | "Daily" | "Hourly" | "Other"
      student_payment_method: "Cash" | "Transfer" | "Card" | "Other"
      student_payment_status: "Pending" | "Paid" | "Partially Paid" | "Overdue"
      teacher_payment_method: "Transfer" | "Check" | "Cash" | "Other"
      teacher_payment_status: "Pending" | "Paid" | "Processing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// FIX: Add missing type exports to resolve compilation errors throughout the application.
// These types are derived from the database schema and are used in various components and pages.
export type Student = Database['public']['Tables']['student']['Row'];
export type Employee = Database['public']['Tables']['employee']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type EmployeeAttendance = Database['public']['Tables']['employee_attendance']['Row'];

export type AttendanceWithStudent = Attendance & {
  student: {
    FirstName: string
    LastName: string
    ProfilePicture: string | null
  } | null
};

export type EmployeeAttendanceWithEmployee = EmployeeAttendance & {
  employee: {
    FirstName: string
    LastName: string
    ProfilePicture: string | null
  } | null
};

export type ActivityWithMedia = Database['public']['Tables']['activity']['Row'] & {
  activity_media: Database['public']['Tables']['activity_media']['Row'][];
  grade: { GradeName: string } | null;
  employee: { FirstName: string, LastName: string } | null;
};


export type UserProfile = {
  userId: number;
  authUserId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
};