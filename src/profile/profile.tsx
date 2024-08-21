import { useEffect, useState } from "react";
import { App } from "../home/App";
import "./profile.css";

export type UserProfile = {
    studentId: string;
    section: "cs" | "it" | "emc" | "act";
    year: number;
}

/**
 * Ensure that the user has filled out their profile before proceeding to the app
 */
export function Profile() {

    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        // get profile from localStorage
        // if there is an existing profile, set it to state, otherwise 
        // prompt the user to fill out the profile form

        const existingProfile = localStorage.getItem("profile");
        if (existingProfile) {
            setProfile(JSON.parse(existingProfile));
        }
    }, []);

    return (
        <>
            {profile === null ? (
                <ProfileForm onProfileFilled={
                    (profile) => {
                        localStorage.setItem("profile", JSON.stringify(profile));
                        setProfile(profile);
                    }
                } />
            ) : (
                <App profile={profile} />
            )}
        </>
    );
}

function ProfileForm(
    props: {
        onProfileFilled: (profile: UserProfile) => void;
    }
) {
    const [page, setPage] = useState(2);

    const [section, setSection] = useState<"cs" | "it" | "emc" | "act">("cs");
    const [year, setYear] = useState(1);
    const [studentId, setStudentId] = useState("");

    const getPage = (page: number) => {
        switch (page) {
            case 0:
                return <SectionForm onSectionSelected={
                    (section) => {
                        setSection(section);
                        setPage(1);
                    }
                } />;
            case 1:
                return <YearForm onYearSelected={
                    (year) => {
                        setYear(year);
                        setPage(2);
                    }
                } />;
            case 2:
                return <StudentIdForm onStudentIdEntered={
                    (studentId) => {
                        setStudentId(studentId);
                        props.onProfileFilled({
                            section,
                            year,
                            studentId
                        });
                    }
                } />;
            default:
                return <div />;
        }
    }

    return (
        <>
            {getPage(page)}

            {/* back button */}
            {page === 1 && (
                <button onClick={() => setPage(page - 1)}>Back</button>
            )}
        </>
    )
}

function StudentIdForm(
    props: {
        onStudentIdEntered: (studentId: string) => void;
    }
) {
    // valid student id is 2021314281 e.g 10 characters
    const [studentId, setStudentId] = useState("");

    const isValidStudentId = (studentId: string) => {
        return true;
    }

    const [error, setError] = useState("");

    return (
        <>
            <div className="section-container">
                <h1>Enter your student ID</h1>
                <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    value={studentId}
                    onChange={(e) => {
                        setStudentId(e.target.value);
                        if (!isValidStudentId(e.target.value)) {
                            setError("Invalid student id");
                        } else {
                            setError("");
                        }
                    }}
                />
                <div>
                    {
                        error.length > 0 && (
                            <p className="error">{error}</p>
                        )
                    }
                </div>
                <button onClick={() => {
                    if (isValidStudentId(studentId)) {
                        props.onStudentIdEntered(studentId);
                    } else {
                        setError("Invalid student id");
                    }
                }}
                    style={{
                        marginTop: "1.5em"
                    }}
                >Submit</button>
            </div>
        </>
    )
}

function YearForm(
    props: {
        onYearSelected: (year: number) => void;
    }
) {
    return (
        <>
            <h1>What year are you?</h1>
            <div className="section-container">
                <div className="card" onClick={
                    () => props.onYearSelected(1)
                }>
                    1st Year
                </div>

                <div className="card" onClick={
                    () => props.onYearSelected(2)
                }>2nd Year</div>

                <div className="card" onClick={
                    () => props.onYearSelected(3)
                }>3rd Year</div>

                <div className="card" onClick={
                    () => props.onYearSelected(4)
                }>4th Year</div>
            </div>
        </>
    )
}

function SectionForm(
    props: {
        onSectionSelected: (section: "cs" | "it" | "emc" | "act") => void;
    }
) {
    return (
        <>
            <h1>What's your section?</h1>
            <div className="section-container">
                <div className="card" onClick={
                    () => props.onSectionSelected("it")
                }>
                    IT
                </div>

                <div className="card" onClick={
                    () => props.onSectionSelected("cs")

                }>CS</div>

                <div className="card" onClick={
                    () => props.onSectionSelected("emc")
                }>EMC</div>

                <div className="card"
                    onClick={
                        () => props.onSectionSelected("act")
                    }
                >ACT</div>
            </div>
        </>
    )
}