import SwiftUI
struct AcademyLesson: Identifiable {
    let id: String
    let title: String
    let explanation: String
    let example: String
    let question: String
    let answer: String
    let reference: String
}
struct AcademyView: View {
    static let lessons = [
        AcademyLesson(id: "python", title: "Python — permissions", explanation: "Un dictionnaire associe des clés à des valeurs. Un ensemble contient des éléments distincts. all vérifie chaque condition, mais renvoie vrai sur une collection vide.", example: "bool(chain) and all(action in permissions.get(role, set()) for role in chain)", question: "Pourquoi vérifier que chain n’est pas vide ?", answer: "Pour empêcher une autorisation accidentelle lorsque all reçoit une collection vide.", reference: "https://docs.python.org/3/library/functions.html#all"),
        AcademyLesson(id: "dns", title: "Réseaux — DNS", explanation: "DNS associe notamment les noms de domaine à des adresses IP. Un échec DNS ne signifie pas nécessairement une panne réseau.", example: "nslookup example.com", question: "Que vérifier si une adresse IP répond mais pas son nom ?", answer: "La résolution DNS, le serveur configuré et les réponses obtenues.", reference: "https://www.rfc-editor.org/rfc/rfc1034"),
        AcademyLesson(id: "git", title: "DevOps — Git", explanation: "Un commit enregistre un état du projet. Une branche permet d’isoler des modifications avant leur intégration.", example: "git status", question: "Quelle commande consulter avant de préparer un commit ?", answer: "git status, puis git diff pour examiner les changements.", reference: "https://git-scm.com/docs/git-status")
    ]
    var body: some View {
        List(Self.lessons) { lesson in
            NavigationLink(lesson.title) { AcademyLessonView(lesson: lesson) }
        }
        .navigationTitle("Academy")
    }
}
private struct AcademyLessonView: View {
    let lesson: AcademyLesson
    @State private var reveal = false
    var body: some View {
        List {
            Section("Comprendre") { Text(lesson.explanation) }
            Section("Exemple") { Text(lesson.example).font(.system(.body, design: .monospaced)).textSelection(.enabled) }
            Section("Exercice") {
                Text(lesson.question)
                Button(reveal ? "Masquer la correction" : "Afficher la correction") { reveal.toggle() }
                if reveal { Text(lesson.answer) }
            }
            Section("Documentation") {
                if let url = URL(string: lesson.reference) { Link("Référence officielle", destination: url) }
            }
        }.navigationTitle(lesson.title)
    }
}
