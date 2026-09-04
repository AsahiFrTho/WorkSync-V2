import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";

export async function POST() {
    try {
        await connectToDatabase();

        const trainee = await Trainee.findOneAndUpdate(
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
            {
                new: true,
                upsert: true,
            }
        );

        return Response.json({
            created: true,
            trainee,
        });
    } catch (error) {
        return Response.json(
            {
                created: false,
                error: error instanceof Error ? error.message : "Could not create trainee",
            },
            { status: 500 }
        );
    }
}