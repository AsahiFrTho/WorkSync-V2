import { connectToDatabase } from "@/lib/mongodb";
import EmploymentRecord from "@/models/employment-record";
import Trainee from "@/models/trainee";

export async function POST() {
  try {
    await connectToDatabase();

    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy;
    };

    // 1. Ensure Trainee 1 (Trainee KP-0001 - KP-0001) exists
    const trainee1 = await Trainee.findOneAndUpdate(
      { traineeId: "KP-0001" },
      {
        name: "Trainee KP-0001",
        district: "Pune",
        course: "Electrician",
        status: "employed",
        monthlyWage: 16800,
        trainingProvider: "Yashaswi Skill Academy, Pune",
        trainingPeriod: {
          startDate: new Date("2023-10-01"),
          endDate: new Date("2024-03-15"),
          hours: 480,
        },
        skills: [
          "Industrial Wiring",
          "Panel Assembly",
          "PLC Basics",
          "Electrical Safety",
          "Digital Tools",
        ],
        certificate: {
          certificateId: "MSD-2024-ELE-00892",
          issueDate: new Date("2024-03-25"),
          nsqfLevel: 4,
          issuer: "NCVET / MSSDS",
          grade: "A (88%)",
        },
      },
      { new: true, upsert: true }
    );

    // 2. Ensure Trainee 2 (Sneha Kadam - KP-0002) exists
    const trainee2 = await Trainee.findOneAndUpdate(
      { traineeId: "KP-0002" },
      {
        name: "Sneha Kadam",
        district: "Nashik",
        course: "Healthcare Assistant",
        status: "employed",
        monthlyWage: 14500,
        trainingProvider: "Sahyadri Institute of Healthcare, Nashik",
        trainingPeriod: {
          startDate: new Date("2023-11-15"),
          endDate: new Date("2024-04-30"),
          hours: 420,
        },
        skills: [
          "Patient Care",
          "Vital Signs",
          "First Aid",
          "Clinical Support",
          "Infection Control",
        ],
        certificate: {
          certificateId: "MSD-2024-HCA-01452",
          issueDate: new Date("2024-05-05"),
          nsqfLevel: 4,
          issuer: "NCVET / Healthcare SSC",
          grade: "A+ (92%)",
        },
      },
      { new: true, upsert: true }
    );

    // 3. Ensure Trainee 3 (Imran Shaikh - KP-0003) exists
    const trainee3 = await Trainee.findOneAndUpdate(
      { traineeId: "KP-0003" },
      {
        name: "Imran Shaikh",
        district: "Pune",
        course: "CNC Machine Operator",
        status: "certified",
        monthlyWage: 0,
        trainingProvider: "Deccan Technical Centre, Pune",
        trainingPeriod: {
          startDate: new Date("2023-11-01"),
          endDate: new Date("2024-04-15"),
          hours: 500,
        },
        skills: [
          "CNC Setup",
          "Machine Operation",
          "Precision Measurement",
          "Workshop Safety",
          "Blueprint Reading",
        ],
        certificate: {
          certificateId: "MSD-2024-CNC-00631",
          issueDate: new Date("2024-04-22"),
          nsqfLevel: 4,
          issuer: "NCVET / Capital Goods SSC",
          grade: "B+ (78%)",
        },
      },
      { new: true, upsert: true }
    );

    const startDate1 = new Date("2024-04-01");
    const startDate2 = new Date("2024-05-15");
    const startDate3 = new Date("2024-05-01");

    // Record 1: Verified Employment (Trainee KP-0001)
    const record1 = await EmploymentRecord.findOneAndUpdate(
      { traineeId: "KP-0001", isCurrent: true },
      {
        trainee: trainee1._id,
        traineeId: "KP-0001",
        employerName: "Deccan Electricals Pvt. Ltd.",
        employerContactEmail: "hr@deccanelectricals.com",
        jobRole: "Junior Maintenance Electrician",
        employmentType: "wage_employment",
        district: "Pune",
        startDate: startDate1,
        isCurrent: true,
        monthlyWage: 16800,
        trainingRelevance: "directly_related",
        verificationStatus: "verified",
        verificationMetadata: {
          verifiedAt: new Date("2024-04-05T10:30:00.000Z"),
          verifiedBy: "HR Manager - Deccan Electricals",
          method: "employer_portal",
          remarks: "Confirmed joining in industrial maintenance wing",
        },
        followUps: [
          {
            milestone: "30_day",
            dueDate: addDays(startDate1, 30),
            completedDate: addDays(startDate1, 30),
            status: "retained",
            currentWage: 16800,
            verifiedBy: "Yashaswi Follow-up Cell",
            notes: "30-day retention confirmed on shift",
          },
          {
            milestone: "90_day",
            dueDate: addDays(startDate1, 90),
            completedDate: addDays(startDate1, 90),
            status: "retained",
            currentWage: 16800,
            verifiedBy: "Yashaswi Follow-up Cell",
            notes: "90-day retention confirmed",
          },
          {
            milestone: "180_day",
            dueDate: addDays(startDate1, 180),
            completedDate: addDays(startDate1, 180),
            status: "retained",
            currentWage: 17500,
            verifiedBy: "Yashaswi Follow-up Cell",
            notes: "6-month milestone completed with increment",
          },
          {
            milestone: "365_day",
            dueDate: addDays(startDate1, 365),
            status: "pending",
          },
        ],
        notes: "Placed via campus drive batch 2024",
      },
      { new: true, upsert: true }
    );

    // Record 2: Pending Employer Verification (Sneha Kadam)
    const record2 = await EmploymentRecord.findOneAndUpdate(
      { traineeId: "KP-0002", isCurrent: true },
      {
        trainee: trainee2._id,
        traineeId: "KP-0002",
        employerName: "Sahyadri Diagnostics & Clinic",
        employerContactEmail: "careers@sahyadriclinics.org",
        jobRole: "Clinical Care Associate",
        employmentType: "wage_employment",
        district: "Nashik",
        startDate: startDate2,
        isCurrent: true,
        monthlyWage: 14500,
        trainingRelevance: "partially_related",
        verificationStatus: "pending",
        verificationMetadata: {},
        followUps: [
          {
            milestone: "30_day",
            dueDate: addDays(startDate2, 30),
            status: "pending",
          },
          {
            milestone: "90_day",
            dueDate: addDays(startDate2, 90),
            status: "pending",
          },
          {
            milestone: "180_day",
            dueDate: addDays(startDate2, 180),
            status: "pending",
          },
          {
            milestone: "365_day",
            dueDate: addDays(startDate2, 365),
            status: "pending",
          },
        ],
        notes: "Offer letter issued post hospital drive",
      },
      { new: true, upsert: true }
    );

    // Record 3: Disputed Employment (Imran Shaikh)
    const record3 = await EmploymentRecord.findOneAndUpdate(
      { traineeId: "KP-0003", isCurrent: true },
      {
        trainee: trainee3._id,
        traineeId: "KP-0003",
        employerName: "Apex Precision Tools",
        employerContactEmail: "hr@apexprecision.in",
        jobRole: "Shopfloor Machine Apprentice",
        employmentType: "apprenticeship",
        district: "Pune",
        startDate: startDate3,
        isCurrent: true,
        monthlyWage: 12000,
        trainingRelevance: "unrelated",
        verificationStatus: "disputed",
        verificationMetadata: {
          disputeReason: "Trainee did not join on scheduled start date",
          remarks: "Candidate reported relocation to another district",
        },
        followUps: [
          {
            milestone: "30_day",
            dueDate: addDays(startDate3, 30),
            status: "left_job",
            notes: "Candidate did not join shift",
          },
        ],
        notes: "Reported through employer portal dispute queue",
      },
      { new: true, upsert: true }
    );

    return Response.json({
      success: true,
      created: true,
      records: [record1, record2, record3],
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        created: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not seed employment records",
      },
      { status: 500 }
    );
  }
}
