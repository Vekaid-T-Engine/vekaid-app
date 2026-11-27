import SwiftUI
public struct RootView: View {
    public init() {}
    public var body: some View {
        TabView {
            NavigationStack { Text("VEKAID").navigationTitle("Aujourd’hui") }.tabItem { Label("Accueil", systemImage: "house") }
            NavigationStack { Text("Missions — intégration à venir").navigationTitle("Work") }.tabItem { Label("Work", systemImage: "briefcase") }
            NavigationStack { Text("Academy — intégration à venir").navigationTitle("Learn") }.tabItem { Label("Learn", systemImage: "graduationcap") }
            NavigationStack { Text("Veille — intégration à venir").navigationTitle("Intel") }.tabItem { Label("Intel", systemImage: "antenna.radiowaves.left.and.right") }
            NavigationStack { Text("Paramètres — intégration à venir").navigationTitle("You") }.tabItem { Label("You", systemImage: "gearshape") }
        }.tint(.primary).preferredColorScheme(.dark)
    }
}
