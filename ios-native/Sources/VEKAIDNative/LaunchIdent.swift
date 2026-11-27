import SwiftUI

struct LaunchIdent: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var progress: CGFloat = 0
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 20) {
                ZStack {
                    Circle().stroke(.white.opacity(0.14), lineWidth: 1).frame(width: 132, height: 132)
                    Circle().stroke(.white.opacity(0.3 * (1 - progress)), lineWidth: 1)
                        .frame(width: 100 + 60 * progress, height: 100 + 60 * progress)
                    Path { p in
                        p.move(to: CGPoint(x: 18, y: 12))
                        p.addLine(to: CGPoint(x: 60, y: 100))
                        p.addLine(to: CGPoint(x: 102, y: 12))
                    }.trim(from: 0, to: reduceMotion ? 1 : progress)
                        .stroke(.white, style: StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round))
                        .frame(width: 120, height: 112)
                }
                Text("VEKAID").font(.system(size: 21, weight: .medium)).tracking(9)
                    .opacity(reduceMotion ? 1 : Double(progress))
            }.foregroundStyle(.white)
        }
        .accessibilityHidden(true)
        .onAppear {
            if reduceMotion { progress = 1 }
            else { withAnimation(.easeOut(duration: 0.65)) { progress = 1 } }
        }
    }
}
