import nodemailer from "nodemailer";

export async function sendApprovalEmail(to: string, firstName: string) {
  try {
    // Si no hay variables de entorno, solo registramos en consola (para desarrollo)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("=========================================");
      console.log(`[MOCK EMAIL] Para: ${to}`);
      console.log(`[MOCK EMAIL] Asunto: ¡Tu solicitud de matrícula en Epixum ha sido aprobada!`);
      console.log(`[MOCK EMAIL] Mensaje: Hola ${firstName}, tu solicitud fue aprobada. Ya puedes ingresar con tu cuenta de Google.`);
      console.log("=========================================");
      return { success: true, mocked: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailSubject = "¡Tu solicitud de matrícula ha sido aprobada!";

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #3FFF8B;">¡Bienvenido/a a Data Stack, ${firstName}!</h2>
          <p style="font-size: 16px; color: #333;">Nos complace informarte que tu solicitud de matrícula ha sido <strong>aprobada</strong>.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3FFF8B; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin-top: 0;"><strong>Importante:</strong></p>
            <ul style="font-size: 15px; color: #333; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Si te registraste con una cuenta de Google:</strong> Ya tienes tu cuenta activa. Puedes acceder directamente a la plataforma haciendo clic en el botón de abajo e iniciando sesión con Google.</li>
              <li><strong>Si te registraste con una cuenta que NO es de Google:</strong> Necesitamos que vuelvas a enviar la solicitud de matriculación utilizando una cuenta de Google (por ejemplo, @gmail.com) para poder darte acceso a la plataforma.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://datastack.epixum.com/login" style="background-color: #3FFF8B; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 25px; display: inline-block;">Ingresar a la Plataforma</a>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://datastack.epixum.com/" style="color: #666; text-decoration: underline; font-size: 14px;">Volver al formulario de matriculación (solo si tu cuenta no era de Google)</a>
          </div>

          <p style="font-size: 14px; color: #666;">Si tienes alguna duda, puedes responder a este correo.</p>
          <p style="font-size: 14px; color: #666;">¡Éxitos en tu cursada!</p>
        </div>
      `;

    const info = await transporter.sendMail({
      from: `"Data Stack" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: to,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
