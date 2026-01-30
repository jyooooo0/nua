/**
 * Email Service for Nua
 * 
 * This module is prepared for Resend integration.
 * When ready to enable emails:
 * 1. npm install resend
 * 2. Add RESEND_API_KEY to .env.local
 * 3. Uncomment the Resend code below
 */

// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export interface ReservationEmailData {
    customerName: string;
    customerEmail: string;
    date: string;
    startTime: string;
    endTime: string;
    menu: string;
}

// Email enabled flag - set to true when Resend is configured
export const EMAIL_ENABLED = false;

/**
 * Send reservation confirmation email
 */
export async function sendConfirmationEmail(data: ReservationEmailData): Promise<boolean> {
    if (!EMAIL_ENABLED) {
        console.log("[Email] Email service not configured. Would send confirmation to:", data.customerEmail);
        console.log("[Email] Reservation details:", data);
        return false;
    }

    // When Resend is configured, uncomment this:
    /*
    try {
        await resend.emails.send({
            from: 'nua <noreply@your-domain.com>',
            to: data.customerEmail,
            subject: '【nua】ご予約が確定しました',
            html: generateConfirmationHtml(data),
        });
        return true;
    } catch (error) {
        console.error("[Email] Failed to send confirmation:", error);
        return false;
    }
    */

    return false;
}

/**
 * Send reservation cancellation email
 */
export async function sendCancellationEmail(data: ReservationEmailData): Promise<boolean> {
    if (!EMAIL_ENABLED) {
        console.log("[Email] Email service not configured. Would send cancellation to:", data.customerEmail);
        return false;
    }

    // When Resend is configured, uncomment this:
    /*
    try {
        await resend.emails.send({
            from: 'nua <noreply@your-domain.com>',
            to: data.customerEmail,
            subject: '【nua】ご予約がキャンセルされました',
            html: generateCancellationHtml(data),
        });
        return true;
    } catch (error) {
        console.error("[Email] Failed to send cancellation:", error);
        return false;
    }
    */

    return false;
}

/**
 * Generate confirmation email HTML
 */
function generateConfirmationHtml(data: ReservationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; color: #5c4a3d; background-color: #f5f3ef; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 4px; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        .details { background: #f9f8f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ご予約が確定しました</h1>
        <p>${data.customerName} 様</p>
        <p>この度はご予約いただきありがとうございます。以下の内容で予約が確定しました。</p>
        
        <div class="details">
            <div class="detail-row">
                <span>日付</span>
                <strong>${data.date}</strong>
            </div>
            <div class="detail-row">
                <span>時間</span>
                <strong>${data.startTime} - ${data.endTime}</strong>
            </div>
            <div class="detail-row">
                <span>メニュー</span>
                <strong>${data.menu}</strong>
            </div>
        </div>
        
        <p>ご来店をお待ちしております。</p>
        
        <div class="footer">
            <p>nua ヘアサロン</p>
            <p>※このメールは自動送信されています。</p>
        </div>
    </div>
</body>
</html>
    `;
}

function generateCancellationHtml(data: ReservationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; color: #5c4a3d; background-color: #f5f3ef; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 4px; }
        h1 { font-size: 24px; margin-bottom: 20px; color: #d32f2f; }
        .details { background: #f9f8f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ご予約がキャンセルされました</h1>
        <p>${data.customerName} 様</p>
        <p>以下のご予約がキャンセルされました。</p>
        
        <div class="details">
            <div class="detail-row">
                <span>日付</span>
                <strong>${data.date}</strong>
            </div>
            <div class="detail-row">
                <span>時間</span>
                <strong>${data.startTime} - ${data.endTime}</strong>
            </div>
            <div class="detail-row">
                <span>メニュー</span>
                <strong>${data.menu}</strong>
            </div>
        </div>
        
        <p>別の日時でのご予約をお待ちしております。</p>
        
        <div class="footer">
            <p>nua ヘアサロン</p>
            <p>※このメールは自動送信されています。</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ========================
// Alternative Date Email
// ========================

export interface AlternativeDateEmailData {
    customerName: string;
    customerEmail: string;
    originalDate: string;
    originalTime: string;
    alternatives: { date: string; time: string }[];
    menu: string;
}

/**
 * Send rejection email with alternative date suggestion
 */
export async function sendAlternativeDateEmail(data: AlternativeDateEmailData): Promise<boolean> {
    if (!EMAIL_ENABLED) {
        console.log("[Email] Email service not configured. Would send alternative date email to:", data.customerEmail);
        console.log("[Email] Alternative date suggestions:", data.alternatives);
        return false;
    }

    // When Resend is configured, uncomment this:
    /*
    try {
        await resend.emails.send({
            from: 'nua <noreply@your-domain.com>',
            to: data.customerEmail,
            subject: '【nua】ご予約についてのご連絡',
            html: generateAlternativeDateHtml(data),
        });
        return true;
    } catch (error) {
        console.error("[Email] Failed to send alternative date email:", error);
        return false;
    }
    */

    return false;
}

/**
 * Generate alternative date suggestion email HTML
 */
function generateAlternativeDateHtml(data: AlternativeDateEmailData): string {
    const hasAlternatives = data.alternatives && data.alternatives.length > 0;

    // Generate HTML for alternatives list
    const alternativesHtml = data.alternatives.map((alt, index) => `
        <div class="detail-row" style="margin-top: 5px;">
            <span>候補 ${index + 1}</span>
            <strong>${alt.date} ${alt.time}</strong>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; color: #5c4a3d; background-color: #f5f3ef; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 4px; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        .details { background: #f9f8f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .cancelled { text-decoration: line-through; color: #999; }
        .alternative { background: #e8f5e9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .alternative h2 { color: #2e7d32; margin-bottom: 10px; font-size: 16px; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ご予約についてのご連絡</h1>
        <p>${data.customerName} 様</p>
        <p>誠に申し訳ございませんが、ご希望の日時でのご予約を承ることができませんでした。</p>
        
        <div class="details">
            <p style="font-size: 12px; color: #999; margin-bottom: 10px;">ご希望の日時</p>
            <div class="detail-row cancelled">
                <span>日付</span>
                <span>${data.originalDate}</span>
            </div>
            <div class="detail-row cancelled">
                <span>時間</span>
                <span>${data.originalTime}</span>
            </div>
            <div class="detail-row">
                <span>メニュー</span>
                <strong>${data.menu}</strong>
            </div>
        </div>
        
        ${hasAlternatives ? `
        <div class="alternative">
            <h2>✨ 別日のご提案</h2>
            <p>以下の日時はいかがでしょうか？</p>
            ${alternativesHtml}
            <p style="font-size: 12px; margin-top: 10px;">ご希望の場合は、お電話またはWebサイトよりご予約ください。</p>
        </div>
        ` : ''}
        
        <p>ご不便をおかけして申し訳ございません。<br>別の日時でのご予約をお待ちしております。</p>
        
        <div class="footer">
            <p>nua ヘアサロン</p>
            <p>※このメールは自動送信されています。</p>
        </div>
    </div>
</body>
</html>
    `;
}


/**
 * Send booking request received email (Pending status)
 */
export async function sendBookingRequestEmail(data: ReservationEmailData): Promise<boolean> {
    if (!EMAIL_ENABLED) {
        console.log("[Email] Email service not configured. Would send booking request receipt to:", data.customerEmail);
        return false;
    }

    // When Resend is configured, uncomment this:
    /*
    try {
        await resend.emails.send({
            from: 'nua <noreply@your-domain.com>',
            to: data.customerEmail,
            subject: '【nua】ご予約リクエストを受け付けました',
            html: generateBookingRequestHtml(data),
        });
        return true;
    } catch (error) {
        console.error("[Email] Failed to send booking request email:", error);
        return false;
    }
    */

    return false;
}

/**
 * Generate booking request email HTML
 */
function generateBookingRequestHtml(data: ReservationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; color: #5c4a3d; background-color: #f5f3ef; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 4px; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        .details { background: #f9f8f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
        .note { font-size: 13px; color: #666; background: #fff3e0; padding: 15px; border-radius: 4px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ご予約リクエストを受け付けました</h1>
        <p>${data.customerName} 様</p>
        <p>ご予約リクエストありがとうございます。<br>以下の内容で承りました。</p>
        
        <div class="details">
            <div class="detail-row">
                <span>日付</span>
                <strong>${data.date}</strong>
            </div>
            <div class="detail-row">
                <span>時間</span>
                <strong>${data.startTime}</strong>
            </div>
            <div class="detail-row">
                <span>メニュー</span>
                <strong>${data.menu}</strong>
            </div>
        </div>
        
        <div class="note">
            <strong>⚠️ まだ予約は確定しておりません</strong><br>
            お店からの確定メールをお待ちください。<br>
            他のお客様との兼ね合いにより、日時の調整をお願いする場合がございます。
        </div>
        
        <div class="footer">
            <p>nua ヘアサロン</p>
            <p>※このメールは自動送信されています。</p>
        </div>
    </div>
</body>
</html>
    `;
}
