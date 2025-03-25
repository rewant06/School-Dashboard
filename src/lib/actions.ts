"use server";

import { revalidatePath } from "next/cache"; // Importing Next.js cache revalidation for dynamic updates.
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas"; // Importing validation schemas for type safety.
import prisma from "./prisma"; // Importing Prisma client for database queries.
import admin from "firebase-admin"; // Importing Firebase Admin SDK for server-side user management.

// Initialize Firebase Admin SDK if not already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Use default credentials (e.g., service account).
  });
}

type CurrentState = { success: boolean; error: boolean }; // Type for tracking operation state.

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name, // Subject name.
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })), // Connect teachers to the subject.
        },
      },
    });

    // revalidatePath("/list/subjects"); // Revalidate the cache for the subjects list.
    return { success: true, error: false }; // Return success state.
  } catch (err) {
    console.log(err); // Log the error.
    return { success: false, error: true }; // Return error state.
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    // Create a new Firebase user for the teacher.
    const user = await admin.auth().createUser({
      email: data.email, // Teacher's email.
      password: data.password, // Teacher's password.
      displayName: `${data.name} ${data.surname}`, // Teacher's full name.
    });

    // Set custom claims for the teacher's role.
    await admin.auth().setCustomUserClaims(user.uid, { role: "teacher" });

    // Create the teacher in the database.
    await prisma.teacher.create({
      data: {
        id: user.uid, // Firebase UID.
        username: data.username, // Teacher's username.
        name: data.name, // Teacher's first name.
        surname: data.surname, // Teacher's last name.
        email: data.email || null, // Teacher's email.
        phone: data.phone || null, // Teacher's phone number.
        address: data.address, // Teacher's address.
        img: data.img || null, // Teacher's profile image.
        bloodType: data.bloodType, // Teacher's blood type.
        sex: data.sex, // Teacher's gender.
        birthday: data.birthday, // Teacher's birthday.
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId), // Connect subjects to the teacher.
          })),
        },
      },
    });

    // revalidatePath("/list/teachers"); // Revalidate the cache for the teachers list.
    return { success: true, error: false }; // Return success state.
  } catch (err) {
    console.log(err); // Log the error.
    return { success: false, error: true }; // Return error state.
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true }; // Return error if no teacher ID is provided.
  }
  try {
    // Update the Firebase user for the teacher.
    await admin.auth().updateUser(data.id, {
      email: data.email, // Update email.
      password: data.password || undefined, // Update password if provided.
      displayName: `${data.name} ${data.surname}`, // Update display name.
    });

    // Update the teacher in the database.
    await prisma.teacher.update({
      where: {
        id: data.id, // Teacher's ID.
      },
      data: {
        username: data.username, // Update username.
        name: data.name, // Update first name.
        surname: data.surname, // Update last name.
        email: data.email || null, // Update email.
        phone: data.phone || null, // Update phone number.
        address: data.address, // Update address.
        img: data.img || null, // Update profile image.
        bloodType: data.bloodType, // Update blood type.
        sex: data.sex, // Update gender.
        birthday: data.birthday, // Update birthday.
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId), // Update connected subjects.
          })),
        },
      },
    });

    // revalidatePath("/list/teachers"); // Revalidate the cache for the teachers list.
    return { success: true, error: false }; // Return success state.
  } catch (err) {
    console.log(err); // Log the error.
    return { success: false, error: true }; // Return error state.
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string; // Get the teacher's ID from the form data.
  try {
    // Delete the Firebase user for the teacher.
    await admin.auth().deleteUser(id);

    // Delete the teacher from the database.
    await prisma.teacher.delete({
      where: {
        id: id, // Teacher's ID.
      },
    });

    // revalidatePath("/list/teachers"); // Revalidate the cache for the teachers list.
    return { success: true, error: false }; // Return success state.
  } catch (err) {
    console.log(err); // Log the error.
    return { success: false, error: true }; // Return error state.
  }
};