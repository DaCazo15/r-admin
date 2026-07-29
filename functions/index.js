const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();

exports.migrateUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const email = request.auth.token.email.toLowerCase().trim();

  const usuarioRef = db.collection("usuarios").doc(email);
  const usuarioSnap = await usuarioRef.get();

  if (usuarioSnap.exists) {
    return { migrated: false, reason: "already_exists" };
  }

  const personaSnap = await db
    .collection("persona")
    .where("correo", "==", email)
    .limit(1)
    .get();

  if (personaSnap.empty) {
    return { migrated: false, reason: "no_persona_found" };
  }

  const personaData = personaSnap.docs[0].data();

  await usuarioRef.set({
    nombre: personaData.nombre || "Usuario",
    correo: email,
    rol: personaData.rol?.toLowerCase() || "socio",
    club: personaData.club || "Isla de Margarita",
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    migrated: true,
    rol: personaData.rol?.toLowerCase() || "socio",
    club: personaData.club || "Isla de Margarita",
    nombre: personaData.nombre || "Usuario",
  };
});

exports.createSocioAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const callerEmail = request.auth.token.email.toLowerCase().trim();

  const callerRef = db.collection("usuarios").doc(callerEmail);
  const callerSnap = await callerRef.get();

  if (!callerSnap.exists) {
    throw new HttpsError(
      "permission-denied",
      "No tienes un perfil de usuario registrado."
    );
  }

  const callerData = callerSnap.data();
  const rolesAdmin = ["presidente", "vicepresidente", "membresia"];

  if (!rolesAdmin.includes(callerData.rol)) {
    throw new HttpsError(
      "permission-denied",
      "No tienes permisos para crear cuentas de socios."
    );
  }

  const { nombre, correo, club } = request.data;

  if (!correo || !nombre) {
    throw new HttpsError(
      "invalid-argument",
      "El nombre y correo son obligatorios."
    );
  }

  const targetEmail = correo.toLowerCase().trim();
  const targetClub = club || callerData.club;

  if (targetClub !== callerData.club) {
    throw new HttpsError(
      "permission-denied",
      "No puedes crear socios en un club diferente al tuyo."
    );
  }

  const clubSnap = await db.collection("club").get();
  const clubDoc = clubSnap.docs.find(
    (d) => d.data().club?.toLowerCase() === targetClub.toLowerCase()
  );

  const passEstandar = clubDoc ? clubDoc.data().passEstandar : "";

  if (!passEstandar) {
    throw new HttpsError(
      "failed-precondition",
      "No hay contraseña estándar configurada para el club."
    );
  }

  const auth = getAuth();

  try {
    const userRecord = await auth.createUser({
      email: targetEmail,
      password: passEstandar,
      displayName: nombre,
    });

    await db.collection("usuarios").doc(targetEmail).set({
      nombre: nombre,
      correo: targetEmail,
      rol: "socio",
      club: targetClub,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return { success: true, reason: "already_exists" };
    }
    throw new HttpsError("internal", error.message);
  }
});
