// ChemBuddy - Level 1 Completion Certificate
//
// Earned when every Level 1 quiz has been taken. Issued once: the first
// download records progress/<uid>/certificate { issuedAt, certId }, and every
// later download reprints the same date and ID.
//
// The layout below is a placeholder until the design approved by Somaiya PR
// is supplied — only drawCertificate() needs to change.

var Certificate = (function () {
    'use strict';

    var JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

    function quizzesDone(progress) {
        var quizzes = (progress && progress.quizzes) || {};
        return learningPath.allEquipment().filter(function (eq) { return quizzes[eq.id]; }).length;
    }

    function isEligible(progress) {
        return quizzesDone(progress) === learningPath.allEquipment().length;
    }

    function averageScore(progress) {
        var quizzes = progress.quizzes || {};
        var all = learningPath.allEquipment();
        var total = all.reduce(function (sum, eq) { return sum + (quizzes[eq.id] ? quizzes[eq.id].score : 0); }, 0);
        return (total / all.length).toFixed(1);
    }

    // Record the certificate the first time; afterwards return the stored one.
    function issue(uid) {
        var ref = db.ref('progress/' + uid + '/certificate');
        return ref.transaction(function (cur) {
            if (cur) return; // already issued — keep it
            var now = Date.now();
            return { issuedAt: now, certId: 'CB-L1-' + new Date(now).getFullYear() + '-' + uid.slice(0, 6).toUpperCase() };
        }).then(function () {
            return ref.once('value');
        }).then(function (snap) {
            return snap.val();
        });
    }

    function download(uid, profile, progress) {
        if (!isEligible(progress)) return Promise.reject(new Error('Not all quizzes are complete yet'));
        return Promise.all([issue(uid), Utils.loadScript(JSPDF_URL)]).then(function (res) {
            var cert = res[0];
            var name = profile.name || (window.ChemBuddy.user.email || '').split('@')[0];
            var doc = drawCertificate({
                name: name,
                college: profile.college || '',
                average: averageScore(progress),
                issuedAt: cert.issuedAt,
                certId: cert.certId
            });
            doc.save('ChemBuddy-Certificate-' + name.replace(/[^A-Za-z0-9]+/g, '-') + '.pdf');
            return cert;
        });
    }

    function drawCertificate(c) {
        var doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        var W = 297, H = 210;
        var navy = [11, 42, 91], orange = [240, 120, 20], grey = [90, 90, 90];
        var count = learningPath.allEquipment().length;

        // Borders
        doc.setFillColor(navy[0], navy[1], navy[2]);
        doc.rect(0, 0, W, H, 'F');
        doc.setFillColor(255, 255, 255);
        doc.rect(8, 8, W - 16, H - 16, 'F');
        doc.setDrawColor(orange[0], orange[1], orange[2]);
        doc.setLineWidth(0.8);
        doc.rect(12, 12, W - 24, H - 24);

        function center(text, y, font, style, size, color) {
            doc.setFont(font, style);
            doc.setFontSize(size);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(text, W / 2, y, { align: 'center' });
        }

        center('ChemBuddy', 30, 'helvetica', 'bold', 20, navy);
        center('Your Equipment Companion', 37, 'helvetica', 'normal', 10, grey);

        center('CERTIFICATE OF COMPLETION', 58, 'helvetica', 'bold', 28, navy);
        doc.setDrawColor(orange[0], orange[1], orange[2]);
        doc.setLineWidth(1);
        doc.line(W / 2 - 40, 63, W / 2 + 40, 63);

        center('This is to certify that', 78, 'helvetica', 'normal', 13, grey);
        center(c.name, 94, 'times', 'bolditalic', 32, navy);
        var y = 104;
        if (c.college) {
            center('of ' + c.college, y, 'helvetica', 'normal', 12, grey);
            y += 9;
        }
        center('has successfully completed', y + 3, 'helvetica', 'normal', 13, grey);
        center('Level 1: Basic Equipment', y + 16, 'helvetica', 'bold', 18, navy);
        center('studying ' + count + ' items of chemical plant equipment across ' + learningPath.modules.length +
            ' modules, with a quiz on each (average score ' + c.average + '/' + learningPath.quizLength + ')', y + 25, 'helvetica', 'normal', 11, grey);

        // Date (left), ID (centre), signature (right)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text(Utils.formatDate(c.issuedAt), 50, 168, { align: 'center' });
        doc.text('Dr. Sundararaman Chintamani', 247, 168, { align: 'center' });
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.3);
        doc.line(25, 171, 75, 171);
        doc.line(215, 171, 279, 171);
        doc.setFontSize(9);
        doc.setTextColor(grey[0], grey[1], grey[2]);
        doc.text('Date of Issue', 50, 176, { align: 'center' });
        doc.text('Suraja Technologies', 247, 176, { align: 'center' });
        doc.text('Certificate ID: ' + c.certId, W / 2, 176, { align: 'center' });

        doc.setFontSize(8);
        doc.text('© ChemBuddy by Suraja Technologies and Jignyashika Consulting', W / 2, 190, { align: 'center' });
        return doc;
    }

    return {
        isEligible: isEligible,
        quizzesDone: quizzesDone,
        download: download
    };
})();
