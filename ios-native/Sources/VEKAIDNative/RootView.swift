import SwiftUI
import Foundation
struct Mission: Codable, Identifiable {
    var id = UUID()
    var title: String
    var completed = false
}
public struct RootView: View {
    @AppStorage("vekaid.native.missions.v1") private var stored = Data()
    @State private var missions: [Mission] = []
    @State private var title = ""
    @State private var failed = false
    @State private var loaded = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var showIdent = true
    public init() {}
    public var body: some View {
        TabView {
            NavigationStack { List { Text("VEKAID Engineering Workspace"); Text("\(missions.filter { !$0.completed }.count) missions actives") }.navigationTitle("Aujourd’hui") }.tabItem { Label("Accueil", systemImage: "house") }
            NavigationStack {
                List {
                    Section("Nouvelle mission") {
                        TextField("Titre", text: $title)
                        Button("Ajouter") {
                            let value = title.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !value.isEmpty else { return }
                            missions.append(Mission(title: value))
                            title = ""
                            save()
                        }.disabled(!loaded || failed || title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                    Section("Missions") {
                        ForEach($missions) { $mission in
                            Toggle(mission.title, isOn: $mission.completed)
                                .disabled(failed)
                                .onChange(of: mission.completed) { _ in save() }
                        }
                    }
                    if failed { Text("Erreur de stockage : données conservées, modifications bloquées.").foregroundStyle(.secondary) }
                }.navigationTitle("Work")
            }.tabItem { Label("Work", systemImage: "briefcase") }
            NavigationStack { AcademyView() }.tabItem { Label("Learn", systemImage: "graduationcap") }
            NavigationStack { Text("Veille — intégration à venir").navigationTitle("Intel") }.tabItem { Label("Intel", systemImage: "antenna.radiowaves.left.and.right") }
            NavigationStack { Text("Prototype natif · stockage indépendant").navigationTitle("You") }.tabItem { Label("You", systemImage: "gearshape") }
        }.tint(.primary).preferredColorScheme(.dark)
        .overlay { if showIdent && !reduceMotion { LaunchIdent().transition(.opacity).allowsHitTesting(false) } }
        .task(id: reduceMotion) {
            guard showIdent else { return }
            if !reduceMotion { try? await Task.sleep(nanoseconds: 850_000_000) }
            guard !Task.isCancelled else { return }
            withAnimation(reduceMotion ? nil : .easeOut(duration: 0.25)) { showIdent = false }
        }
        .task {
            guard !loaded else { return }
            defer { loaded = true }
            guard !stored.isEmpty else { return }
            do { missions = try JSONDecoder().decode([Mission].self, from: stored) }
            catch { failed = true }
        }
    }
    private func save() {
        guard loaded, !failed else { return }
        do { stored = try JSONEncoder().encode(missions) }
        catch { failed = true }
    }
}
