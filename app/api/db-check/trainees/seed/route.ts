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