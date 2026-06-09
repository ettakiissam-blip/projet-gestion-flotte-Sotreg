const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
let text = fs.readFileSync(filePath, 'utf8');

const old1 = "            if (!dateDebutStr) { alert(\"⚠️ Veuillez sélectionner une date de début.\"); return; }\r\n\r\n\r\n\r\n            let dateCourante = new Date(dateDebutStr); \r\n\r\n            const dateFinObj = new Date(dateFinStr);\r\n\r\n            let totalJoursAffectes = 0;\r\n\r\n\r\n\r\n            // On boucle de manière linéaire sur chaque jour de la période choisie\r\n\r\n            while (dateCourante <= dateFinObj) {\r\n\r\n                const chaineDateInterne = `${dateCourante.getFullYear()}-${String(dateCourante.getMonth()+1).padStart(2,'0')}-${String(dateCourante.getDate()).padStart(2,'0')}`;\r\n\r\n                const dFormateeFr = formaterDate(chaineDateInterne);\r\n\r\n\r\n\r\n                // On écrase ou on crée l'affectation identique pour ce jour précis de la boucle\r\n\r\n                planningSOTREG = planningSOTREG.filter(p => !(p.date === dFormateeFr && p.trajetId === trajetId));\r\n\r\n                planningSOTREG.push({ \r\n\r\n                    id: Date.now() + Math.random(), \r\n\r\n                    date: dFormateeFr, \r\n\r\n                    trajetId: trajetId, \r\n\r\n                    vehiculeId: vId ? parseInt(vId) : \"\", \r\n\r\n                    conducteurId: cId ? parseInt(cId) : \"\", \r\n\r\n                    absent: true, \r\n\r\n                    remplaceConducteurId: \"\", \r\n\r\n                    remplaceVehiculeId: \"\" \r\n\r\n                });\r\n\r\n                totalJoursAffectes++;\r\n\r\n\r\n\r\n                dateCourante.setDate(dateCourante.getDate() + 1);\r\n\r\n            }\r\n\r\n\r\n\r\n            enregistrerDonnies();";
const new1 = "            if (!dateDebutStr) { alert(\"⚠️ Veuillez sélectionner une date de début.\"); return; }\r\n\r\n            const totalJoursAffectes = enregistrerPlanningIntervalle(trajetId, cId, vId, dateDebutStr, dateFinStr);\r\n\r\n            enregistrerDonnies();";

const old2 = "            alert(`✅ Affectation identique enregistrée et copiée sur les ${totalJoursAffectes} jours de la période !`);\r\n\r\n        }\r\n\r\n\r\n        function sauvegarderToutesModificationsPlanning() {";
const new2 = "            alert(`✅ Affectation identique enregistrée et copiée sur les ${totalJoursAffectes} jours de la période !`);\r\n\r\n        }\r\n\r\n        function enregistrerPlanningIntervalle(trajetId, cId, vId, dateDebutStr, dateFinStr) {\r\n            const dateDebut = new Date(dateDebutStr);\r\n            const dateFin = new Date(dateFinStr);\r\n            let dateCourante = new Date(dateDebut);\r\n            let totalJoursAffectes = 0;\r\n\r\n            while (dateCourante <= dateFin) {\r\n                const internalDate = `${dateCourante.getFullYear()}-${String(dateCourante.getMonth() + 1).padStart(2, '0')}-${String(dateCourante.getDate()).padStart(2, '0')}`;\r\n                const formattedDate = formaterDate(internalDate);\r\n\r\n                planningSOTREG = planningSOTREG.filter(p => !(p.date === formattedDate && p.trajetId === trajetId));\r\n                planningSOTREG.push({\r\n                    id: Date.now() + Math.random(),\r\n                    date: formattedDate,\r\n                    trajetId: trajetId,\r\n                    vehiculeId: vId ? parseInt(vId, 10) : \"\",\r\n                    conducteurId: cId ? parseInt(cId, 10) : \"\",\r\n                    absent: true,\r\n                    remplaceConducteurId: \"\",\r\n                    remplaceVehiculeId: \"\"\r\n                });\r\n                totalJoursAffectes++;\r\n                dateCourante.setDate(dateCourante.getDate() + 1);\r\n            }\r\n\r\n            return totalJoursAffectes;\r\n        }\r\n\r\n        function sauvegarderToutesModificationsPlanning() {";

if (!text.includes(old1)) {
  console.error('old1 not found');
  process.exit(1);
}
if (!text.includes(old2)) {
  console.error('old2 not found');
  process.exit(1);
}
text = text.replace(old1, new1);
text = text.replace(old2, new2);
fs.writeFileSync(filePath, text, 'utf8');
console.log('patched');
