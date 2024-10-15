import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;
  if (token) {
    user = await getUserFromToken(token);
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </main>
  );
}

// FORM FIELDS NEEDED FROM THE PARTNER
// - Business Name
// - Business Address
// - Business Phone Number
// - Business Description
// - Business Hours
// - Business Email
// - Business type - (dropdown)

// - if business type is "gym", then:
//   - classes only
//   - gym floor only
//   - both classes and gym floor

// once the business type is defined e.g "gym" the partner can now select a button to add schedules for the gym
// when the button is clicked, a form will pop up and the partner can select different options for the schedule via a modal pop up
// - name of the class
// - price
// - description of the class
// - instructor of the class
// - duration of the class
// - capacity of the class, e.g. how many spaces are available for the class
// - calender selection to select the days of the week the class is available this should have the option to select the date e.g. a specific data or a repeated data or a range.
